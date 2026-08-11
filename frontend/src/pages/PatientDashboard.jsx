import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';

const recentActivity = [
  { title: 'Lab Results: Blood Panel', meta: 'Status: Normal', time: '2 days ago', type: 'lab' },
  { title: 'Appointment Completed', meta: 'Dr. James Wilson · General Checkup', time: '1 week ago', type: 'appointment' },
  { title: 'Invoice Paid', meta: 'Visit on Oct 10', time: '2 weeks ago', type: 'invoice' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user.email.split('@')[0];

  return (
    <div className="patient-dashboard">
      <h1 className="patient-greeting">Hello, {firstName}</h1>
      <p className="patient-subtitle">Here is an overview of your care plan.</p>

      <div className="patient-columns">
        <div className="patient-main-col">
          <div className="panel next-appt-panel">
            <div className="panel-header-row">
              <span className="panel-header">Your Next Appointment</span>
              <button className="manage-link">Manage</button>
            </div>

            <span className="confirmed-chip">Confirmed</span>

            <div className="appt-detail-row">
              <div className="appt-icon">📅</div>
              <div>
                <div className="appt-detail-title">Thu, Oct 24</div>
                <div className="appt-detail-sub">10:30 AM - 11:15 AM</div>
              </div>

              <div className="appt-provider">
                <div className="provider-avatar">SC</div>
                <div>
                  <div className="appt-detail-title">Dr. Sarah Chen</div>
                  <div className="appt-detail-sub">Cardiology Specialist</div>
                </div>
              </div>
            </div>

            <div className="appt-location">📍 Main Campus · Building B, Floor 3, Room 304</div>
          </div>

          <div className="panel">
            <div className="panel-header-row">
              <span className="panel-header">Recent Activity</span>
              <button className="manage-link">View all →</button>
            </div>

            {recentActivity.map((item, i) => (
              <div className="activity-row" key={i}>
                <div className="activity-icon">•</div>
                <div className="activity-body">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-meta">{item.meta}</div>
                </div>
                <div className="activity-time">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="patient-side-col">
          <button className="side-action-btn primary" onClick={() => navigate('/patient/book-appointment')}>
            <span className="side-action-title">Book New Appointment</span>
            <span className="side-action-sub">Find a time that works</span>
          </button>

          <button className="side-action-btn">
            <span className="side-action-title">View Test Results</span>
            <span className="side-action-sub">1 new result available</span>
          </button>

          <button className="side-action-btn">
            <span className="side-action-title">Message Doctor</span>
            <span className="side-action-sub">General inquiries</span>
          </button>
        </div>
      </div>
    </div>
  );
}