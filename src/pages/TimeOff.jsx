import { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { mockEmployees, mockCurrentUser } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import './TimeOff.css';

export function TimeOff() {
  const isAdmin = mockCurrentUser?.role === 'ADMIN' || mockCurrentUser?.role === 'HR';
  const { addToast } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ type: 'Paid Time Off', start: '', end: '', allocation: '01.00', file: null });
  const [fileName, setFileName] = useState('');

  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, employee: mockEmployees[1], type: 'Paid time Off', start: '28/10/2025', end: '28/10/2025', status: 'Pending' },
    { id: 2, employee: mockEmployees[6], type: 'Sick Leave', start: '24/10/2025', end: '25/10/2025', status: 'Pending' },
  ]);

  const handleAction = (id, action) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    if (action === 'approve') {
      addToast('Leave request approved.', 'success');
    } else {
      addToast('Leave request rejected.', 'error');
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.start || !newRequest.end) {
      addToast('Please fill out all request details.', 'error');
      return;
    }

    const mockNewRequest = {
      id: Date.now(),
      employee: mockCurrentUser,
      type: newRequest.type,
      start: newRequest.start,
      end: newRequest.end,
      status: 'Pending'
    };

    setPendingRequests([mockNewRequest, ...pendingRequests]);
    setIsDrawerOpen(false);
    setNewRequest({ type: 'Paid Time Off', start: '', end: '', allocation: '01.00', file: null });
    setFileName('');
    addToast('Your time off request has been submitted.', 'success');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // Generate a mock calendar grid
  const days = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="timeoff-page bg-black text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Time Off</h1>
          <div className="flex gap-4 mt-4">
            <span className="text-blue-400 cursor-pointer border-b-2 border-blue-400 pb-1">Time Off</span>
            {isAdmin && <span className="text-gray-400 cursor-pointer">Allocation</span>}
          </div>
        </div>
        <button 
          className="bg-pink-500 text-white px-6 py-2 rounded shadow flex items-center gap-2 hover:bg-pink-600 transition"
          onClick={() => setIsDrawerOpen(true)}
        >
           NEW
        </button>
      </div>

      {!isAdmin ? (
        <div className="employee-calendar-view mt-6 border border-gray-800 p-4 rounded bg-[#0a0a0a]">
          <div className="flex justify-between border-b border-gray-800 pb-4 mb-4">
            <div className="text-center w-1/2 border-r border-gray-800">
              <h3 className="text-blue-400 font-semibold">Paid time Off</h3>
              <p className="text-xs text-gray-400">29 Days Available</p>
            </div>
            <div className="text-center w-1/2">
              <h3 className="text-blue-400 font-semibold">Sick time off</h3>
              <p className="text-xs text-gray-400">07 Days Available</p>
            </div>
          </div>
          
          <div className="calendar-mock grid grid-cols-7 gap-2 p-4 text-xs text-gray-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center font-bold">{d}</div>
            ))}
            {days.map(d => {
              const isPaid = d === 14 || d === 15;
              const isSick = d === 22;
              return (
                <div key={d} className="aspect-square flex items-center justify-center relative">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    isPaid ? 'bg-blue-500/20 text-blue-400 border border-blue-500' : 
                    isSick ? 'bg-red-500/20 text-red-400 border border-red-500' : 
                    'hover:bg-gray-800 cursor-pointer'
                  }`}>
                    {d <= 30 ? d : d - 30}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="admin-table-view mt-6">
          <div className="flex justify-between mb-4 bg-[#111] p-3 rounded items-center border border-gray-800">
            <div className="flex gap-8">
              <div className="text-center">
                <span className="text-blue-400 block text-sm font-semibold">Paid time Off</span>
                <span className="text-xs text-gray-500">29 Days Available</span>
              </div>
              <div className="text-center">
                <span className="text-blue-400 block text-sm font-semibold">Sick time off</span>
                <span className="text-xs text-gray-500">07 Days Available</span>
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-gray-800 bg-[#0a0a0a]">
            <thead>
              <tr className="border-b border-gray-800 text-sm">
                <th className="p-3 border-r border-gray-800">Name</th>
                <th className="p-3 border-r border-gray-800">Start Date</th>
                <th className="p-3 border-r border-gray-800">End Date</th>
                <th className="p-3 border-r border-gray-800">Time off Type</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(req => (
                <tr key={req.id} className="border-b border-gray-800 text-sm hover:bg-gray-900 transition">
                  <td className="p-3 border-r border-gray-800 font-mono">[{req.employee.firstName} {req.employee.lastName}]</td>
                  <td className="p-3 border-r border-gray-800 font-mono">{req.start}</td>
                  <td className="p-3 border-r border-gray-800 font-mono">{req.end}</td>
                  <td className="p-3 border-r border-gray-800 text-blue-400">{req.type}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'reject')}
                      className="w-5 h-5 bg-red-500 rounded-sm hover:bg-red-600 transition"
                      title="Reject"
                    />
                    <button 
                      onClick={() => handleAction(req.id, 'approve')}
                      className="w-5 h-5 bg-green-500 rounded-sm hover:bg-green-600 transition"
                      title="Approve"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 p-4 border border-gray-800 bg-[#111] rounded-lg">
            <h3 className="font-mono text-yellow-500 mb-2">Note</h3>
            <p className="text-sm text-gray-400">Employees can view only their own time off records, while Admins and HR Officers can view time off records & approve/reject them for all employees.</p>
          </div>
        </div>
      )}

      {/* Request Leave Modal (Drawer style) */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`fixed right-0 top-0 h-full w-[400px] bg-[#111] border-l border-gray-800 shadow-2xl transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg">Time off Type Request</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <form className="p-6 flex flex-col gap-6" onSubmit={handleRequestSubmit}>
          <div className="flex items-center">
            <label className="w-1/3 text-sm text-gray-400">Employee</label>
            <div className="w-2/3 text-blue-400 font-mono">[{mockCurrentUser.firstName} {mockCurrentUser.lastName}]</div>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-sm text-gray-400">Time off Type</label>
            <select 
              className="w-2/3 bg-transparent border border-gray-700 text-blue-400 p-2 rounded focus:outline-none focus:border-blue-500"
              value={newRequest.type}
              onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
            >
              <option value="Paid Time Off" className="bg-black">Paid Time off</option>
              <option value="Sick Leave" className="bg-black">Sick Leave</option>
              <option value="Unpaid Leaves" className="bg-black">Unpaid Leaves</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-sm text-gray-400">Validity Period</label>
            <div className="w-2/3 flex items-center gap-2">
              <input 
                type="date" 
                className="bg-transparent text-blue-400 border-none outline-none text-sm w-full"
                value={newRequest.start}
                onChange={(e) => setNewRequest({...newRequest, start: e.target.value})}
              />
              <span className="text-gray-500">To</span>
              <input 
                type="date" 
                className="bg-transparent text-blue-400 border-none outline-none text-sm w-full"
                value={newRequest.end}
                onChange={(e) => setNewRequest({...newRequest, end: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-sm text-gray-400">Allocation</label>
            <div className="w-2/3 flex items-center gap-2">
              <input 
                type="text" 
                className="bg-transparent text-blue-400 border border-gray-700 p-1 w-20 rounded text-center"
                value={newRequest.allocation}
                onChange={(e) => setNewRequest({...newRequest, allocation: e.target.value})}
              />
              <span className="text-gray-400 text-sm">Days</span>
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-1/3 text-sm text-gray-400 pt-2">Attachment</label>
            <div className="w-2/3">
              <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition shadow-lg">
                <Upload size={14} />
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
              <span className="text-xs text-gray-500 ml-3">(For sick leave certificate)</span>
              {fileName && <div className="mt-2 text-xs text-green-400 truncate w-full">{fileName}</div>}
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
            <button type="submit" className="bg-pink-500 text-white px-6 py-2 rounded shadow hover:bg-pink-600 transition">Submit</button>
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white px-4">Discard</button>
          </div>
        </form>
      </div>
    </div>
  );
}
