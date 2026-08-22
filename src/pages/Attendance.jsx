import { useState } from 'react';
import { Play, Square, Download, Search } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import './Attendance.css';

export function Attendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const isAdmin = true; // Hardcoded based on mock user

  // Mock attendance log
  const attendanceLog = [
    { id: 1, employee: mockEmployees[0], date: 'Oct 24, 2024', checkIn: '09:01 AM', checkOut: '05:30 PM', hours: '8h 29m', extra: '30m', status: 'Present' },
    { id: 2, employee: mockEmployees[1], date: 'Oct 24, 2024', checkIn: '-', checkOut: '-', hours: '-', extra: '-', status: 'On Leave' },
    { id: 3, employee: mockEmployees[3], date: 'Oct 24, 2024', checkIn: '-', checkOut: '-', hours: '-', extra: '-', status: 'Absent' },
    { id: 4, employee: mockEmployees[4], date: 'Oct 24, 2024', checkIn: '08:50 AM', checkOut: '05:00 PM', hours: '8h 10m', extra: '10m', status: 'Present' },
  ];

  return (
    <div className="attendance-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-muted">Manage daily attendance and timesheets</p>
        </div>
      </header>

      {/* Employee View: Today Section */}
      <section className="card today-section">
        <div className="today-info">
          <h2>Today</h2>
          <p className="current-date">Thursday, October 24, 2024</p>
          <div className="time-display">
            {isCheckedIn ? '04:12:45' : '00:00:00'}
          </div>
          {isCheckedIn && <p className="text-muted text-sm mt-2">Started at 09:00 AM</p>}
        </div>

        <div className="today-actions">
          {!isCheckedIn ? (
            <button className="btn check-btn check-in-btn" onClick={() => setIsCheckedIn(true)}>
              <Play fill="currentColor" size={20} /> Check In
            </button>
          ) : (
            <button className="btn check-btn check-out-btn" onClick={() => setIsCheckedIn(false)}>
              <Square fill="currentColor" size={20} /> Check Out
            </button>
          )}
        </div>
      </section>

      {/* Admin View: Attendance Log */}
      {isAdmin && (
        <section className="card attendance-log-section mt-6">
          <div className="log-header">
            <h3>Attendance Log</h3>
            <div className="log-actions">
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input type="text" placeholder="Search employee..." className="search-input" />
              </div>
              <input type="date" className="date-picker" defaultValue="2024-10-24" />
              <button className="btn btn-secondary btn-sm"><Download size={16} /> Export</button>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Extra Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLog.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div className="emp-cell">
                        <img src={record.employee.avatarUrl} alt={record.employee.firstName} className="emp-avatar-xs" />
                        <span>{record.employee.firstName} {record.employee.lastName}</span>
                      </div>
                    </td>
                    <td>{record.date}</td>
                    <td className="font-mono text-sm">{record.checkIn}</td>
                    <td className="font-mono text-sm">{record.checkOut}</td>
                    <td className="font-mono text-sm">{record.hours}</td>
                    <td className="font-mono text-sm text-muted">{record.extra}</td>
                    <td>
                      {record.status === 'Present' && <span className="badge badge-success">Present</span>}
                      {record.status === 'Absent' && <span className="badge badge-error">Absent</span>}
                      {record.status === 'On Leave' && <span className="badge badge-info">On Leave</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
