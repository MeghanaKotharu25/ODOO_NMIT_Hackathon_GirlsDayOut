import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const attendanceData = [
  { name: 'Mon', present: 110, absent: 5, leave: 13 },
  { name: 'Tue', present: 115, absent: 3, leave: 10 },
  { name: 'Wed', present: 112, absent: 4, leave: 12 },
  { name: 'Thu', present: 108, absent: 8, leave: 12 },
  { name: 'Fri', present: 105, absent: 10, leave: 13 },
];

export function Dashboard() {
  return (
    <div className="dashboard-editorial">
      
      {/* Top Editorial Section */}
      <section className="dashboard-hero">
        <div className="hero-typography">
          <h1 className="hero-greeting">Good morning, Elena.</h1>
          <p className="hero-date font-mono">Thursday, October 24, 2024</p>
          
          <div className="hero-operational-summary">
            <div className="summary-stat">
              <span className="stat-value font-mono">115</span>
              <span className="stat-label">Present</span>
              <span className="stat-trend positive"><ArrowUpRight size={14}/> 2%</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value font-mono">3</span>
              <span className="stat-label">Absent</span>
              <span className="stat-trend negative"><ArrowDownRight size={14}/> 1%</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value font-mono">10</span>
              <span className="stat-label">On Leave</span>
              <span className="stat-trend neutral">Approved</span>
            </div>
          </div>
        </div>

        {/* The Ledger: Needs Attention */}
        <div className="attention-ledger">
          <div className="ledger-header">
            <h3>Needs Attention</h3>
            <span className="badge badge-warning">3 Items</span>
          </div>
          
          <ul className="ledger-list">
            <li className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">08:45 AM</span>
                <span className="ledger-tag error">Unexcused</span>
              </div>
              <p className="ledger-text"><strong>David Kim</strong> is absent without requested leave.</p>
              <button className="btn-link">Review Record</button>
            </li>
            
            <li className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">Yesterday</span>
                <span className="ledger-tag info">Pending</span>
              </div>
              <p className="ledger-text"><strong>2 leave requests</strong> require your approval.</p>
              <button className="btn-link">View Queue</button>
            </li>
            
            <li className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">09:15 AM</span>
                <span className="ledger-tag warning">Late</span>
              </div>
              <p className="ledger-text"><strong>5 employees</strong> checked in after 09:00 AM.</p>
              <button className="btn-link">See Details</button>
            </li>
          </ul>
        </div>
      </section>

      {/* Integrated Visualization Section */}
      <section className="dashboard-visualization">
        <div className="viz-header">
          <h3>Attendance Rhythm</h3>
          <span className="text-muted font-mono text-sm">Current Week</span>
        </div>
        
        <div className="viz-container">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attendanceData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: 'var(--border-strong)' }} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }} 
              />
              <Tooltip 
                cursor={{fill: 'var(--bg-subtle)'}}
                contentStyle={{ 
                  borderRadius: '0px', 
                  border: '1px solid var(--border-heavy)', 
                  boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="present" name="Present" fill="var(--text-primary)" radius={[0, 0, 0, 0]} barSize={48} />
              <Bar dataKey="absent" name="Absent" fill="var(--text-muted)" radius={[0, 0, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      
    </div>
  );
}
