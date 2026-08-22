import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Users, UserX, Clock, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Good morning, Elena</h1>
          <p className="text-muted">Here's what's happening today, October 24.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="card metric-card">
              <div className="metric-icon-wrapper success">
                <Users size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Present Today</span>
                <div className="metric-value-row">
                  <span className="metric-value">115</span>
                  <span className="metric-trend positive">
                    <ArrowUpRight size={14} /> 2%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon-wrapper warning">
                <UserX size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Absent</span>
                <div className="metric-value-row">
                  <span className="metric-value">3</span>
                  <span className="metric-trend negative">
                    <ArrowDownRight size={14} /> 1%
                  </span>
                </div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-wrapper info">
                <CalendarDays size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">On Leave</span>
                <div className="metric-value-row">
                  <span className="metric-value">10</span>
                  <span className="text-muted text-sm ml-2">Approved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="card chart-card">
            <div className="chart-header">
              <h3>Attendance Trend</h3>
              <select className="chart-select">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#F4F4F5'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E4E4E7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="absent" name="Absent" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="leave" name="On Leave" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          {/* Needs Attention */}
          <div className="card attention-card">
            <div className="attention-header">
              <h3>Needs Attention</h3>
              <span className="badge badge-warning">3</span>
            </div>
            
            <div className="attention-list">
              <div className="attention-item">
                <div className="attention-icon error">
                  <UserX size={16} />
                </div>
                <div className="attention-content">
                  <p className="attention-title">David Kim absent</p>
                  <p className="attention-desc">No leave requested</p>
                </div>
                <button className="btn btn-secondary btn-sm">Review</button>
              </div>
              
              <div className="attention-item">
                <div className="attention-icon info">
                  <CalendarDays size={16} />
                </div>
                <div className="attention-content">
                  <p className="attention-title">2 Pending leaves</p>
                  <p className="attention-desc">Requires approval</p>
                </div>
                <button className="btn btn-secondary btn-sm">View</button>
              </div>

              <div className="attention-item">
                <div className="attention-icon warning">
                  <Clock size={16} />
                </div>
                <div className="attention-content">
                  <p className="attention-title">Late check-ins</p>
                  <p className="attention-desc">5 employees late today</p>
                </div>
                <button className="btn btn-secondary btn-sm">Details</button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card activity-card mt-6">
            <div className="activity-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-dot success"></div>
                <div className="timeline-content">
                  <p className="timeline-text"><strong>Sarah Chen</strong> checked in</p>
                  <span className="timeline-time">9:01 AM</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot success"></div>
                <div className="timeline-content">
                  <p className="timeline-text"><strong>Marcus J.</strong> checked in</p>
                  <span className="timeline-time">8:58 AM</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot info"></div>
                <div className="timeline-content">
                  <p className="timeline-text"><strong>Elena R.</strong> approved leave for <strong>Chloe M.</strong></p>
                  <span className="timeline-time">Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
