import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { staggerContainer, staggerItem, drawLine, transitionSnappy } from '../utils/motion';
import { Magnetic } from '../components/layout/Magnetic';
import './Dashboard.css';

const attendanceData = [
  { name: 'Mon', present: 110, absent: 5, leave: 13 },
  { name: 'Tue', present: 115, absent: 3, leave: 10 },
  { name: 'Wed', present: 112, absent: 4, leave: 12 },
  { name: 'Thu', present: 108, absent: 8, leave: 12 },
  { name: 'Fri', present: 105, absent: 10, leave: 13 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
            <h1 className="hero-greeting glitch-text" data-text={`Good morning, ${user?.firstName || 'Operator'}.`}>Good morning, {user?.firstName || 'Operator'}.</h1>
          </motion.div>
          <motion.div variants={staggerItem}>
            <p className="hero-date font-mono uppercase text-sm tracking-widest text-muted">{currentDate}</p>
          </motion.div>
          
          <motion.div variants={staggerItem} className="hero-operational-summary">
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
          </motion.div>
        </div>

        <motion.div variants={staggerItem} className="attention-ledger">
          <div className="ledger-header">
            <h3>Needs Attention</h3>
            <span className="badge badge-warning">3 Items</span>
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
                <span className="font-mono text-sm">08:45 AM</span>
                <span className="ledger-tag error">Unexcused</span>
              </div>
              <p className="ledger-text"><strong>David Kim</strong> is absent without requested leave.</p>
              <Magnetic strength={0.15}>
                <button className="btn-link" onClick={() => navigate('/employees/EMP-005')}>Review Record</button>
              </Magnetic>
            </motion.li>
            
            <motion.li variants={staggerItem} className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">Yesterday</span>
                <span className="ledger-tag info">Pending</span>
              </div>
              <p className="ledger-text"><strong>2 leave requests</strong> require your approval.</p>
              <Magnetic strength={0.15}>
                <button className="btn-link" onClick={() => navigate('/time-off')}>View Queue</button>
              </Magnetic>
            </motion.li>
            
            <motion.li variants={staggerItem} className="ledger-item">
              <div className="ledger-meta">
                <span className="font-mono text-sm">09:15 AM</span>
                <span className="ledger-tag warning">Late</span>
              </div>
              <p className="ledger-text"><strong>5 employees</strong> checked in after 09:00 AM.</p>
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
            <span className="text-muted font-mono text-sm">LIVE</span>
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
        </motion.div>
      </section>
      
      
      {/* Ticker Tape */}
      <motion.div 
        variants={staggerItem}
        className="system-ticker mt-12 border-y border-[var(--border-heavy)] py-2 overflow-hidden bg-[var(--bg-subtle)]" 
        style={{ borderColor: 'var(--border-heavy)' }}
      >
        <div className="ticker-content font-mono text-xs uppercase tracking-widest whitespace-nowrap">
          SYSTEM SECURE // NO CRITICAL ALERTS // NODE 44 ONLINE // {currentDate.toUpperCase()} // LATENCY: 24MS // 
          ALL PROTOCOLS NOMINAL // PERSONNEL REGISTRY SYNCED // ATTENDANCE RATE: 92% // NEXT BACKUP IN 4H 12M //
        </div>
      </motion.div>
      
    </motion.div>
  );
}
