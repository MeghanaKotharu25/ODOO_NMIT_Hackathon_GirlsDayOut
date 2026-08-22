import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { staggerContainer, staggerItem, drawLine } from '../utils/motion';
import { Magnetic } from '../components/layout/Magnetic';
import './Dashboard.css';

const defaultAttendanceData = [
  { name: 'Mon', present: 10, absent: 1, leave: 1 },
  { name: 'Tue', present: 12, absent: 0, leave: 1 },
  { name: 'Wed', present: 11, absent: 1, leave: 0 },
  { name: 'Thu', present: 13, absent: 0, leave: 0 },
  { name: 'Fri', present: 12, absent: 1, leave: 0 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState({ present: 0, absent: 0, leave: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    attendanceService.getAttendanceSummary()
      .then(stats => {
        if (isMounted && stats) setSummary(stats);
      })
      .catch(err => console.warn('Dashboard summary error:', err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);
  
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      className="dashboard-editorial"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      
      {/* Top Editorial Section */}
      <section className="dashboard-hero">
        <div className="hero-typography">
          <motion.div variants={staggerItem} style={{ overflow: 'hidden' }}>
            <h1 className="hero-greeting glitch-text" data-text={`Good morning, ${user?.firstName || user?.profile?.first_name || 'Operator'}.`}>
              Good morning, {user?.firstName || user?.profile?.first_name || 'Operator'}.
            </h1>
          </motion.div>
          <motion.div variants={staggerItem}>
            <p className="hero-date font-mono uppercase text-sm tracking-widest text-muted">{currentDate}</p>
          </motion.div>
          <motion.div variants={drawLine} className="border-b-2 border-heavy mb-6"></motion.div>
          
          <motion.div variants={staggerItem} className="hero-operational-summary">
            <div className="summary-stat">
              <span className="stat-value font-mono">{loading ? '—' : summary.present}</span>
              <span className="stat-label">Present</span>
              <span className="stat-trend positive"><ArrowUpRight size={14}/> Today</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value font-mono">{loading ? '—' : summary.absent}</span>
              <span className="stat-label">Absent</span>
              <span className="stat-trend negative"><ArrowDownRight size={14}/> Today</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value font-mono">{loading ? '—' : summary.leave}</span>
              <span className="stat-label">On Leave</span>
              <span className="stat-trend neutral">Approved</span>
            </div>
          </motion.div>
        </div>

        <motion.div variants={staggerItem} className="attention-ledger">
          <div className="ledger-header">
            <h3>Needs Attention</h3>
            <span className="badge badge-warning">Live Overview</span>
          </div>
          
          <motion.ul 
            className="ledger-list"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.li variants={staggerItem} className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">Roster</span>
                <span className="ledger-tag info">Live</span>
              </div>
              <p className="ledger-text"><strong>{summary.total} active personnel</strong> registered in system database.</p>
              <Magnetic strength={0.15}>
                <button className="btn-link" onClick={() => navigate('/employees')}>View Roster</button>
              </Magnetic>
            </motion.li>
            
            <motion.li variants={staggerItem} className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">Requests</span>
                <span className="ledger-tag info">Pending</span>
              </div>
              <p className="ledger-text">Leave and attendance requests require attention.</p>
              <Magnetic strength={0.15}>
                <button className="btn-link" onClick={() => navigate('/time-off')}>View Queue</button>
              </Magnetic>
            </motion.li>
            
            <motion.li variants={staggerItem} className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">Attendance</span>
                <span className="ledger-tag warning">Daily</span>
              </div>
              <p className="ledger-text">Live check-in & check-out time log entries.</p>
              <Magnetic strength={0.15}>
                <button className="btn-link" onClick={() => navigate('/attendance')}>See Details</button>
              </Magnetic>
            </motion.li>
          </motion.ul>
        </motion.div>
      </section>

      {/* Integrated Visualization Section */}
      <section className="dashboard-visualization">
        <div className="viz-header">
          <h3>Attendance Rhythm</h3>
          <div className="flex items-center gap-2">
            <span className="text-muted font-mono text-sm">LIVE DATABASE</span>
            <motion.span 
              className="w-2 h-2 rounded-full bg-black relative"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <motion.span 
                className="absolute inset-0 rounded-full border border-black"
                animate={{ scale: [1, 3], opacity: [1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
              />
            </motion.span>
          </div>
        </div>
        
        <motion.div 
          className="viz-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={defaultAttendanceData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
        </motion.div>
      </section>
      
      {/* Ticker Tape */}
      <motion.div 
        variants={staggerItem}
        className="system-ticker mt-12 border-y border-[var(--border-heavy)] py-2 overflow-hidden bg-[var(--bg-subtle)]" 
        style={{ borderColor: 'var(--border-heavy)' }}
      >
        <div className="ticker-content font-mono text-xs uppercase tracking-widest whitespace-nowrap">
          SYSTEM SECURE // SUPABASE BACKEND LIVE // NODE 44 ONLINE // {currentDate.toUpperCase()} // LATENCY: 24MS //
          ALL PROTOCOLS NOMINAL // PERSONNEL REGISTRY SYNCED // ATTENDANCE LOG ACTIVE //
        </div>
      </motion.div>
      
    </motion.div>
  );
}
