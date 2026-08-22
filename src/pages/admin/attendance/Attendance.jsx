import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, Save } from 'lucide-react';
import { attendanceService } from '../../../services/attendanceService';
import './Attendance.css';

const statuses = ['present', 'absent', 'half_day', 'leave'];

const toInputTime = (value) => value ? new Date(value).toTimeString().slice(0, 5) : '';

const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : '--';

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(attendanceService.getLocalDate());
  const [records, setRecords] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
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
      setDrafts(Object.fromEntries(rows.map((row) => [row.profile.id, {
        status: row.status,
        checkIn: toInputTime(row.checkIn),
        checkOut: toInputTime(row.checkOut),
      }])));
    } catch (loadError) {
      console.error('Unable to load admin attendance:', loadError);
      setError(loadError.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (employeeId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [employeeId]: { ...current[employeeId], [field]: value },
    }));
  };

  const saveRecord = async (row) => {
    const draft = drafts[row.profile.id];
    setSavingId(row.profile.id);
    setError('');

    const result = await attendanceService.saveAdminRecord(row, selectedDate, draft);

    if (result.error) setError(result.error.message);
    else await loadAttendance();
    setSavingId(null);
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
          <CalendarDays size={18} />
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
          <CalendarDays size={20} aria-hidden="true" />
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Check in</th><th>Check out</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="attendance-empty">Loading attendance records...</td></tr>
              ) : records.length ? records.map((row) => (
                <tr key={row.profile.id}>
                  <td>
                    <strong>{row.profile.first_name} {row.profile.last_name}</strong>
                    <small>{row.profile.employee_code} · {row.profile.email}</small>
                  </td>
                  <td>{row.profile.department || row.profile.position || 'Employee'}</td>
                  <td>{formatTime(row.checkIn)}</td>
                  <td>{formatTime(row.checkOut)}</td>
                  <td>
                    <select
                      className={`admin-status-select ${drafts[row.profile.id]?.status}`}
                      value={drafts[row.profile.id]?.status || row.status}
                      onChange={(event) => updateDraft(row.profile.id, 'status', event.target.value)}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status.replace('_', '-')}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="admin-edit-actions">
                      <input aria-label={`Check-in time for ${row.profile.first_name}`} type="time" value={drafts[row.profile.id]?.checkIn || ''} onChange={(event) => updateDraft(row.profile.id, 'checkIn', event.target.value)} />
                      <input aria-label={`Check-out time for ${row.profile.first_name}`} type="time" value={drafts[row.profile.id]?.checkOut || ''} onChange={(event) => updateDraft(row.profile.id, 'checkOut', event.target.value)} />
                      <button className="btn btn-primary" type="button" onClick={() => saveRecord(row)} disabled={savingId === row.profile.id}>
                        <Save size={15} /> {savingId === row.profile.id ? 'Saving' : 'Save'}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="attendance-empty">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
