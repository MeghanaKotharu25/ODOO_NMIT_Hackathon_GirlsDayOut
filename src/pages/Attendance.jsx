import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import './Attendance.css';

const attendanceLog = [
  { id: 1, date: '2024-10-24', checkIn: '08:58 AM', checkOut: '--', status: 'Working', hours: '--' },
  { id: 2, date: '2024-10-23', checkIn: '09:02 AM', checkOut: '05:30 PM', status: 'Completed', hours: '8h 28m' },
  { id: 3, date: '2024-10-22', checkIn: '08:55 AM', checkOut: '05:15 PM', status: 'Completed', hours: '8h 20m' },
  { id: 4, date: '2024-10-21', checkIn: '09:10 AM', checkOut: '06:00 PM', status: 'Late', hours: '8h 50m' },
  { id: 5, date: '2024-10-18', checkIn: '08:50 AM', checkOut: '05:05 PM', status: 'Completed', hours: '8h 15m' },
];

export function Attendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer simulation
  useEffect(() => {
    let interval;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  return (
    <div className="attendance-page">
      
      {/* Operational Control Center */}
      <section className="attendance-control-center">
        <div className="control-info">
          <h1 className="page-title">Operations Log</h1>
          <p className="font-mono text-muted uppercase">Terminal Active: {new Date().toLocaleTimeString()}</p>
        </div>
        
        <div className={`status-terminal ${isCheckedIn ? 'active' : 'idle'}`}>
          <div className="terminal-display">
            <span className="terminal-label">{isCheckedIn ? 'Current Session' : 'System Idle'}</span>
            <span className="terminal-time font-mono">
              {isCheckedIn ? formatTime(elapsedTime) : '00:00:00'}
            </span>
          </div>
          <button 
            className={`btn-action ${isCheckedIn ? 'stop' : 'start'}`}
            onClick={handleToggle}
          >
            {isCheckedIn ? (
              <><Square size={16} fill="currentColor" /> Terminate Session</>
            ) : (
              <><Play size={16} fill="currentColor" /> Initialize Shift</>
            )}
          </button>
        </div>
      </section>

      {/* Heavy Typographic Divider */}
      <div className="section-divider">
        <span className="divider-label font-mono">Historical Record</span>
        <div className="divider-line"></div>
      </div>

      {/* Editorial Data Table */}
      <section className="attendance-history">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th className="text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.map((log) => (
                <tr key={log.id} className={log.status === 'Working' ? 'row-active' : ''}>
                  <td className="font-mono">{log.date}</td>
                  <td className="font-mono">{log.checkIn}</td>
                  <td className="font-mono">{log.checkOut}</td>
                  <td>
                    <span className={`status-text ${log.status.toLowerCase()}`}>
                      {log.status === 'Working' && <span className="pulse-dot"></span>}
                      {log.status}
                    </span>
                  </td>
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
