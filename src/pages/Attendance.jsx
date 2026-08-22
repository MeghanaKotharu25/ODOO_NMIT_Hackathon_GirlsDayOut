import { useEffect, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Attendance.css';

export function Attendance() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const userUuid = user?.id || user?.uuid || null;
      const records = await attendanceService.getAttendance(userUuid);
      setAttendanceRecords(records);
      setDbError(null);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = records.find(r => r.date === todayStr);
      if (todayRecord) {
        if (todayRecord.rawCheckIn) setCheckInTime(new Date(todayRecord.rawCheckIn));
        if (todayRecord.rawCheckOut) setCheckOutTime(new Date(todayRecord.rawCheckOut));
      }
    } catch (err) {
      console.warn('Attendance fetch notice:', err.message);
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user]);

  const formatTime = (date) => {
    if (!date) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start, end) => {
    if (!start) return '--';
    const totalMinutes = Math.max(0, Math.floor((end - start) / 60000));
    return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}m`;
  };

  const handleCheckIn = async () => {
    const now = new Date();
    setCheckInTime(now);
    setCheckOutTime(null);
    const userUuid = user?.id || user?.uuid;
    if (userUuid) {
      try {
        await attendanceService.checkIn(userUuid);
        if (addToast) addToast('Check-in recorded in database', 'success');
        loadAttendance();
      } catch (err) {
        if (addToast) addToast(err.message, 'error');
      }
    } else {
      if (addToast) addToast('Check-in recorded', 'info');
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    setCheckOutTime(now);
    const userUuid = user?.id || user?.uuid;
    if (userUuid) {
      try {
        await attendanceService.checkOut(userUuid, checkInTime ? checkInTime.toISOString() : null);
        if (addToast) addToast('Check-out recorded in database', 'success');
        loadAttendance();
      } catch (err) {
        if (addToast) addToast(err.message, 'error');
      }
    } else {
      if (addToast) addToast('Check-out recorded', 'info');
    }
  };

  const isCheckedIn = Boolean(checkInTime) && !checkOutTime;
  const currentStatus = checkOutTime ? 'Present' : checkInTime ? 'Present' : 'Not checked in';

  return (
    <div className="attendance-page">
      <section className="attendance-control-center">
        <div className="control-info">
          <p className="eyebrow font-mono">Employee attendance</p>
          <h1 className="page-title">Daily time record</h1>
          <p className="font-mono text-muted">Live clock · {currentTime.toLocaleDateString()}</p>
        </div>
        <div className="clock-panel">
          <span className="terminal-label">Current time</span>
          <strong className="live-clock font-mono">{currentTime.toLocaleTimeString()}</strong>
          <div className="attendance-actions">
            <button className="btn-action start" onClick={handleCheckIn} disabled={isCheckedIn || Boolean(checkOutTime)}>
              <LogIn size={16} /> Check in
            </button>
            <button className="btn-action stop" onClick={handleCheckOut} disabled={!isCheckedIn}>
              <LogOut size={16} /> Check out
            </button>
          </div>
        </div>
      </section>

      {dbError && (
        <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-mono rounded">
          Notice: {dbError}
        </div>
      )}

      <section className="attendance-summary" aria-label="Today's attendance summary">
        <div className="summary-card">
          <span className="summary-label font-mono">Today's check-in</span>
          <strong>{formatTime(checkInTime)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label font-mono">Today's check-out</span>
          <strong>{formatTime(checkOutTime)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label font-mono">Current status</span>
          <span className={`status-badge ${currentStatus.toLowerCase().replaceAll(' ', '-')}`}>{currentStatus}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label font-mono">Total hours worked</span>
          <strong>{formatDuration(checkInTime, checkOutTime || currentTime)}</strong>
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
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Status</th>
                <th className="text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="font-mono text-center py-6 text-muted">
                    Loading database attendance records...
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="font-mono text-center py-6 text-muted">
                    No attendance records found in database.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono">{log.date}</td>
                    <td>{log.employeeName} <span className="text-xs font-mono text-muted">({log.employeeCode})</span></td>
                    <td className="font-mono">{log.checkIn}</td>
                    <td className="font-mono">{log.checkOut}</td>
                    <td><span className={`status-badge ${log.status.toLowerCase().replaceAll(' ', '').replaceAll('-', '')}`}>{log.status}</span></td>
                    <td className="font-mono text-right">{log.hours}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
