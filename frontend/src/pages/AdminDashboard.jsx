import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const recentRegistrations = [
  { initials: 'JD', name: 'John Doe', meta: 'PT-8472 · Cardiology', time: 'NEW' },
  { initials: 'ES', name: 'Emma Smith', meta: 'PT-8471 · Pediatrics', time: '10m ago' },
  { initials: 'MW', name: 'Michael Wong', meta: 'PT-8470 · Orthopedics', time: '1h ago' },
  { initials: 'LJ', name: 'Lisa Johnson', meta: 'PT-8469 · General', time: '2h ago' },
  { initials: 'RA', name: 'Robert Ali', meta: 'PT-8468 · Neurology', time: '3h ago' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="admin-subtitle">Today's clinic performance metrics.</p>
        </div>
        <input className="admin-search" placeholder="Search patients, doctors..." />
      </div>

      <div className="admin-stat-row">
        <div className="admin-stat-card">
          <div className="stat-label">Appointments Today</div>
          <div className="stat-value">142</div>
          <div className="stat-delta up">↑ 12% vs yesterday</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Active Doctors</div>
          <div className="stat-value">24</div>
          <div className="stat-delta neutral">— 0% vs last week</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Total Patients</div>
          <div className="stat-value">8,459</div>
          <div className="stat-delta up">↑ 4.3% vs last month</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Clinic Capacity</div>
          <div className="stat-value">82%</div>
          <div className="capacity-bar">
            <div className="capacity-fill" style={{ width: '82%' }}></div>
          </div>
          <div className="stat-delta neutral">Near peak capacity</div>
        </div>
      </div>

      <div className="admin-columns">
        <div className="panel volume-panel">
          <div className="panel-header-row">
            <div>
              <div className="panel-header">Weekly Patient Volume</div>
              <div className="panel-subheader">Admissions and outpatients over the last 7 days.</div>
            </div>
            <div className="volume-toggle">
              <button className="toggle-btn active">Week</button>
              <button className="toggle-btn">Month</button>
            </div>
          </div>
          <svg viewBox="0 0 500 180" className="volume-chart" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#0f766e"
              strokeWidth="3"
              points="10,140 80,90 150,120 220,60 290,100 360,40 430,20"
            />
          </svg>
          <div className="volume-days">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
        </div>

        <div className="panel registrations-panel">
          <div className="panel-header-row">
            <span className="panel-header">Recent Registrations</span>
          </div>
          {recentRegistrations.map((reg, i) => (
            <div className="registration-row" key={i}>
              <div className="reg-avatar">{reg.initials}</div>
              <div className="reg-body">
                <div className="reg-name">{reg.name}</div>
                <div className="reg-meta">{reg.meta}</div>
              </div>
              <div className={`reg-time ${reg.time === 'NEW' ? 'new-badge' : ''}`}>{reg.time}</div>
            </div>
          ))}
          <button className="view-all-btn">View All →</button>
        </div>
      </div>
    </div>
  );
}