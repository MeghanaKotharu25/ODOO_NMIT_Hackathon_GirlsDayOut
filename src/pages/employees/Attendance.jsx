import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { calculateWorkHours, calculateScheduledHours } from '../../utils/attendanceUtils';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import '../Attendance.css';

const formatTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (checkIn, checkOut, workHours) => {
  if (typeof workHours === 'number') {
    const minutes = Math.round(workHours * 60);
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
  }
  if (!checkIn) return '--';
  const hours = calculateWorkHours(checkIn, checkOut || new Date().toISOString());
  const minutes = Math.round(hours * 60);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const statusClass = (status) => status.replace('_', '').toLowerCase();

export default function Attendance() {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(attendanceService.getLocalDate().slice(0, 7));
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
  }, [user, selectedMonth]);

  const loadAttendanceData = async () => {
    try {
      setError('');
      const [todayData, historyData] = await Promise.all([
        attendanceService.getTodayRecord(user.id),
        attendanceService.getMonthlyHistory(user.id, selectedMonth),
      ]);

      setTodayRecord(todayData);
      setHistory(historyData);
    } catch (err) {
      console.error('Unable to load attendance:', err);
      setError('Unable to load attendance records. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      await attendanceService.checkIn(user.id);
      await loadAttendanceData();
    } catch (insertError) {
      setError(insertError.message);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      await attendanceService.checkOut(user.id, todayRecord?.check_in);
      await loadAttendanceData();
    } catch (updateError) {
      setError(updateError.message);
    }
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
            <button className="btn-action start" onClick={handleCheckIn} disabled={loading || Boolean(todayRecord?.check_in)}>
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
          <strong>{formatDuration(todayRecord?.check_in, todayRecord?.check_out || currentTime, todayRecord?.work_hours)}</strong>
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

      <div className="attendance-history-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-secondary" onClick={() => {
            const date = new Date(selectedMonth + '-01');
            date.setMonth(date.getMonth() - 1);
            setSelectedMonth(date.toISOString().slice(0, 7));
          }}>&lt;</button>
          <button className="btn-secondary" onClick={() => {
            const date = new Date(selectedMonth + '-01');
            date.setMonth(date.getMonth() + 1);
            setSelectedMonth(date.toISOString().slice(0, 7));
          }}>&gt;</button>
        </div>
        <input id="attendance-month" type="month" className="form-input" style={{ width: 'auto' }} value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
        
        <div className="stats-pills" style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <div className="stat-pill border px-3 py-1 rounded border-black">
            Count of days present: {history.filter(r => r.status === 'present' || r.status === 'half_day').length}
          </div>
          <div className="stat-pill border px-3 py-1 rounded border-black">
            Leaves count: {history.filter(r => r.status === 'leave').length}
          </div>
          <div className="stat-pill border px-3 py-1 rounded border-black">
            Total working days: {history.length}
          </div>
        </div>
      </div>

      <section className="attendance-history">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Extra hours</th>
              </tr>
            </thead>
            <tbody>
              {history.length ? history.map((record) => {
                let worked = record.work_hours || 0;
                if (!worked && record.check_in && record.check_out) {
                  worked = calculateWorkHours(record.check_in, record.check_out);
                }
                
                const scheduledHours = calculateScheduledHours(user?.profile?.default_in_time, user?.profile?.default_out_time);
                
                // Extra Hours
                const extraHours = Math.max(0, worked - scheduledHours);

                return (
                  <tr key={record.id}>
                    <td className="font-mono">{record.date}</td>
                    <td className="font-mono">{formatTime(record.check_in)}</td>
                    <td className="font-mono">{formatTime(record.check_out)}</td>
                    <td className="font-mono">
                      {worked > 0 ? `${Math.floor(worked)}h ${Math.round((worked % 1) * 60).toString().padStart(2, '0')}m` : '--'}
                    </td>
                    <td className="font-mono" style={{ color: extraHours > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {extraHours > 0 ? `+${Math.floor(extraHours)}h ${Math.round((extraHours % 1) * 60).toString().padStart(2, '0')}m` : '--'}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="attendance-empty">No attendance records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}