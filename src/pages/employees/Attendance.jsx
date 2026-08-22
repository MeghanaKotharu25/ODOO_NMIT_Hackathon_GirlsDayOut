import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import '../Attendance.css';

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const formatTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (checkIn, checkOut) => {
  if (!checkIn) return '--';
  const duration = Math.max(0, new Date(checkOut || Date.now()) - new Date(checkIn));
  const minutes = Math.floor(duration / 60000);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const statusClass = (status) => status.replace('_', '').toLowerCase();

export default function Attendance() {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.id) loadAttendanceData();
  }, [user]);

  const loadAttendanceData = async () => {
    const date = getLocalDate();
    try {
      setError('');
      const { data: todayData, error: todayError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.id)
        .eq('date', date)
        .maybeSingle();
      if (todayError) throw todayError;
      
      const { data: historyData, error: historyError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.id)
        .order('date', { ascending: false })
        .limit(30);
      if (historyError) throw historyError;

      setTodayRecord(todayData);
      setHistory(historyData || []);
    } catch (err) {
      console.error('Unable to load attendance:', err);
      setError('Unable to load attendance records. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    const { error: insertError } = await supabase.from('attendance').insert({
      employee_id: user.id,
      date: getLocalDate(),
      check_in: new Date().toISOString(),
      status: 'present',
    });
    if (insertError) setError(insertError.message);
    else await loadAttendanceData();
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    const { error: updateError } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('employee_id', user.id)
      .eq('date', getLocalDate())
      .is('check_out', null);
    if (updateError) setError(updateError.message);
    else await loadAttendanceData();
    setLoading(false);
  };

  return (
    <div className="attendance-page">
      <section className="attendance-control-center">
        <div className="control-info">
          <p className="eyebrow font-mono">Employee attendance</p>
          <h1 className="page-title">Daily time record</h1>
          <p className="font-mono text-muted">{currentTime.toLocaleDateString()}</p>
        </div>
        <div className="clock-panel">
          <span className="terminal-label"><Clock size={14} /> Current time</span>
          <strong className="live-clock font-mono">{currentTime.toLocaleTimeString()}</strong>
          <div className="attendance-actions">
            <button className="btn-action start" onClick={handleCheckIn} disabled={loading || Boolean(todayRecord)}>
              <LogIn size={16} /> {loading ? 'Saving...' : 'Check in'}
            </button>
            <button className="btn-action stop" onClick={handleCheckOut} disabled={loading || !todayRecord?.check_in || Boolean(todayRecord?.check_out)}>
              <LogOut size={16} /> {loading ? 'Saving...' : 'Check out'}
            </button>
          </div>
        </div>
      </section>

      {error && <p className="attendance-error"><AlertCircle size={16} /> {error}</p>}

      <section className="attendance-summary" aria-label="Today's attendance summary">
        <div className="summary-card">
          <span className="summary-label font-mono">Today's check-in</span>
          <strong>{formatTime(todayRecord?.check_in)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label font-mono">Today's check-out</span>
          <strong>{formatTime(todayRecord?.check_out)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label font-mono">Total hours worked</span>
          <strong>{formatDuration(todayRecord?.check_in, todayRecord?.check_out)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label font-mono">Current status</span>
          <span className={`status-badge ${todayRecord ? 'present' : 'not-checked-in'}`}>
            {todayRecord?.check_out ? 'Completed' : todayRecord ? 'Present' : 'Not checked in'}
          </span>
        </div>
      </section>

      <div className="section-divider">
        <span className="divider-label font-mono">Attendance history</span>
        <div className="divider-line"></div>
      </div>

      <section className="attendance-history">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th><th className="text-right">Duration</th></tr>
            </thead>
            <tbody>
              {history.length ? history.map((record) => (
                <tr key={record.id}>
                  <td className="font-mono">{record.date}</td>
                  <td className="font-mono">{formatTime(record.check_in)}</td>
                  <td className="font-mono">{formatTime(record.check_out)}</td>
                  <td><span className={`status-badge ${statusClass(record.status)}`}>{record.status.replace('_', '-')}</span></td>
                  <td className="font-mono text-right">{formatDuration(record.check_in, record.check_out)}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="attendance-empty">No attendance records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}