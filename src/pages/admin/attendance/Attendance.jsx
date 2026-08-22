import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, Search, Save } from 'lucide-react';
import { attendanceService } from '../../../services/attendanceService';
import './Attendance.css';

const statuses = ['present', 'absent', 'half_day', 'leave'];

const toInputTime = (value) => value ? new Date(value).toTimeString().slice(0, 5) : '';

const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : '--';

const formatHours = (row) => {
  if (typeof row.workHours === 'number') {
    return `${Math.floor(row.workHours)}h ${String(Math.round((row.workHours % 1) * 60)).padStart(2, '0')}m`;
  }
  if (!row.checkIn || !row.checkOut) return '--';
  const minutes = Math.max(0, Math.floor((new Date(row.checkOut) - new Date(row.checkIn)) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const formatExtraHours = (row) => {
  if (!row.checkIn || !row.checkOut) return '--';
  const hours = typeof row.workHours === 'number'
    ? row.workHours
    : (new Date(row.checkOut) - new Date(row.checkIn)) / 3600000;
  const extraMinutes = Math.max(0, Math.round((hours - 8) * 60));
  return `${Math.floor(extraMinutes / 60)}h ${String(extraMinutes % 60).padStart(2, '0')}m`;
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(attendanceService.getLocalDate());
  const [records, setRecords] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const shiftDate = (days) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  const visibleRecords = records.filter(({ profile }) => {
    const search = searchTerm.toLowerCase().trim();
    return !search || `${profile.first_name} ${profile.last_name} ${profile.employee_code} ${profile.department || ''}`.toLowerCase().includes(search);
  });

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
            <h2>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
            <p className="text-muted">{visibleRecords.length} of {records.length} employees in the register</p>
          </div>
          <div className="admin-list-controls">
            <div className="admin-search"><Search size={16} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search employees" /></div>
            <button type="button" className="admin-icon-button" title="Previous day" onClick={() => shiftDate(-1)}><ChevronLeft size={18} /></button>
            <button type="button" className="admin-icon-button" title="Next day" onClick={() => shiftDate(1)}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Check in</th><th>Check out</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="attendance-empty">Loading attendance records...</td></tr>
              ) : visibleRecords.length ? visibleRecords.map((row) => (
                <tr key={row.profile.id}>
                  <td>
                    <strong>{row.profile.first_name} {row.profile.last_name}</strong>
                    <small>{row.profile.employee_code} · {row.profile.email}</small>
                  </td>
                  <td>{row.profile.department || row.profile.position || 'Employee'}</td>
                  <td>{formatTime(row.checkIn)}</td>
                  <td>{formatTime(row.checkOut)}</td>
                  <td className="font-mono">{formatHours(row)}<small className="extra-hours">+{formatExtraHours(row)} extra</small></td>
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
                <tr><td colSpan="7" className="attendance-empty">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
