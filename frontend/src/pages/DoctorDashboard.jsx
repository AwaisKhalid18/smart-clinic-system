import { useAuth } from '../context/AuthContext';
import './DoctorDashboard.css';

const upcomingAppointments = [
  { time: '09:00 AM', patient: 'Eleanor Vance', id: 'PT-8421', reason: 'Hypertension Follow-up', status: 'In Session' },
  { time: '10:30 AM', patient: 'Marcus Thorne', id: 'PT-1092', reason: 'Routine Checkup', status: 'Confirmed' },
  { time: '11:15 AM', patient: 'David Lin', id: 'PT-3310', reason: 'Migraine Assessment', status: 'Confirmed' },
  { time: '01:00 PM', patient: 'Sarah Jenkins', id: 'PT-5021', reason: 'Blood Test Results', status: 'Cancelled' },
];

const statusClass = {
  'In Session': 'status-badge status-active',
  Confirmed: 'status-badge status-confirmed',
  Cancelled: 'status-badge status-cancelled',
};

export default function DoctorDashboard() {
  const { user } = useAuth();

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-columns">
        <div className="main-col">
          <p className="greeting-eyebrow">Good morning, {user.email}</p>
          <h1 className="page-title">Today's Schedule</h1>

          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Total Patients</div>
              <div className="stat-value">24</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Remaining</div>
              <div className="stat-value">18</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Cancellations</div>
              <div className="stat-value stat-danger">2</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">Upcoming Appointments</div>
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.time}</td>
                    <td>
                      <div className="patient-cell">
                        <div className="avatar-sm">{appt.patient.charAt(0)}</div>
                        <div>
                          <div className="patient-name">{appt.patient}</div>
                          <div className="patient-id">ID: {appt.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{appt.reason}</td>
                    <td>
                      <span className={statusClass[appt.status]}>{appt.status}</span>
                    </td>
                    <td className="actions-cell">•••</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-col">
          <div className="panel">
            <div className="panel-header">Quick Search</div>
            <input className="search-input" placeholder="Patient Name or ID..." />
            <div className="recent-searches-label">Recent Searches</div>
            <div className="recent-search-item">Marcus Thorne</div>
            <div className="recent-search-item">PT-3310</div>
          </div>

          <div className="panel up-next-panel">
            <div className="panel-header-row">
              <span className="panel-header">Up Next</span>
              <span className="up-next-time">10:30 AM</span>
            </div>

            <div className="up-next-avatar">MT</div>
            <div className="up-next-name">Marcus Thorne</div>
            <div className="up-next-meta">34 yrs • Male • PT-1092</div>

            <div className="up-next-block">
              <div className="up-next-block-label">Reason for Visit</div>
              <div className="reason-chip">Routine Checkup - Annual Physical</div>
            </div>

            <div className="up-next-block">
              <div className="up-next-block-label">Last Visit</div>
              <div>Oct 12, 2023 (6 mos ago)</div>
            </div>

            <div className="up-next-block">
              <div className="up-next-block-label">Alerts</div>
              <div className="alert-chip">Penicillin Allergy</div>
            </div>

            <button className="open-chart-btn">Open Full Chart</button>
          </div>
        </div>
      </div>
    </div>
  );
}