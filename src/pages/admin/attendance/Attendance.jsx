import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { attendanceService } from '../../../services/attendanceService';
import { calculateWorkHours, calculateScheduledHours, isLateCheckIn } from '../../../utils/attendanceUtils';
import './Attendance.css';


const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : '--';

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(attendanceService.getLocalDate());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await attendanceService.getAdminAttendance(selectedDate);
      setRecords(rows);
    } catch (loadError) {
      console.error('Unable to load admin attendance:', loadError);
      setError(loadError.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-attendance-page">
      <header className="admin-attendance-header">
        <div>
          <p className="eyebrow font-mono">Admin console</p>
          <h1>Attendance overview</h1>
          <p className="text-muted">Review and correct the daily attendance register.</p>
        </div>
        <label className="admin-date-picker">
          <span className="font-mono">Review date</span>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
      </header>

      {error && <p className="attendance-error"><AlertCircle size={16} /> {error}</p>}

      <section className="admin-attendance-table card">
        <div className="admin-table-heading">
          <div>
            <h2>{selectedDate}</h2>
            <p className="text-muted">{records.length} employees in the register</p>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Work Hours</th>
                <th>Extra Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="attendance-empty">Loading attendance records...</td></tr>
              ) : records.length ? records.map((row) => {
                
                // Work Hours calculation
                let worked = row.workHours || 0;
                if (!worked && row.checkIn && row.checkOut) {
                  worked = calculateWorkHours(row.checkIn, row.checkOut);
                }
                
                // Scheduled Hours Calculation
                const scheduledHours = calculateScheduledHours(row.profile.default_in_time, row.profile.default_out_time);
                
                // Extra Hours
                const extraHours = Math.max(0, worked - scheduledHours);
                
                // Late Detection
                const isLate = isLateCheckIn(row.checkIn, row.profile.default_in_time);

                return (
                  <tr key={row.profile.id} className={isLate ? 'admin-row-late' : ''}>
                    <td>
                      <strong>{row.profile.first_name} {row.profile.last_name}</strong>
                      <small>{row.profile.employee_code} · {row.profile.department}</small>
                    </td>
                    <td>
                      <span className={isLate ? 'text-late font-mono font-bold' : ''}>
                        {formatTime(row.checkIn)} {isLate && <span className="late-badge">LATE</span>}
                      </span>
                    </td>
                    <td>{formatTime(row.checkOut)}</td>
                    <td className="font-mono text-sm">
                      {worked > 0 ? `${Math.floor(worked)}h ${Math.round((worked % 1) * 60).toString().padStart(2, '0')}m` : '--'}
                    </td>
                    <td className="font-mono text-sm" style={{ color: extraHours > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {extraHours > 0 ? `+${Math.floor(extraHours)}h ${Math.round((extraHours % 1) * 60).toString().padStart(2, '0')}m` : '--'}
                    </td>
                    <td>
                      <span className={`status-badge ${row.status.replace('_', '').toLowerCase()}`}>
                        {row.status.replace('_', '-')}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="attendance-empty">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
