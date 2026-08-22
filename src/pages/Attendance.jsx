import { useEffect, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import './Attendance.css';

const attendanceLog = [
  { id: 1, date: '2024-10-24', checkIn: '08:58 AM', checkOut: '--', status: 'Present', hours: '--' },
  { id: 2, date: '2024-10-23', checkIn: '09:02 AM', checkOut: '05:30 PM', status: 'Present', hours: '8h 28m' },
  { id: 3, date: '2024-10-22', checkIn: '08:55 AM', checkOut: '05:15 PM', status: 'Present', hours: '8h 20m' },
  { id: 4, date: '2024-10-21', checkIn: '09:10 AM', checkOut: '06:00 PM', status: 'Late', hours: '8h 50m' },
  { id: 5, date: '2024-10-18', checkIn: '--', checkOut: '--', status: 'Absent', hours: '--' },
  { id: 6, date: '2024-10-17', checkIn: '09:05 AM', checkOut: '01:00 PM', status: 'Half-day', hours: '4h 00m' },
];

export function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const formatTime = (date) => {
    if (!date) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCheckIn = () => {
    setCheckInTime(new Date());
    setCheckOutTime(null);
  };

  const handleCheckOut = () => setCheckOutTime(new Date());
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
                <th>Check in</th>
                <th>Check out</th>
                <th>Status</th>
                <th className="text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono">{log.date}</td>
                  <td className="font-mono">{log.checkIn}</td>
                  <td className="font-mono">{log.checkOut}</td>
                  <td><span className={`status-badge ${log.status.toLowerCase().replaceAll('-', '')}`}>{log.status}</span></td>
                  <td className="font-mono text-right">{log.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
