import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Icon from '../components/Icon';
import './PatientDashboard.css';

const statusMeta = {
  PENDING: { label: 'Scheduled', className: 'badge-scheduled' },
  CONFIRMED: { label: 'Confirmed', className: 'badge-confirmed' },
  CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user.email.split('@')[0];
  const [appointments, setAppointments] = useState([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, rxRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/prescriptions'),
        ]);
        setAppointments(apptRes.data);
        setPrescriptionCount(rxRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const now = new Date();
  const upcoming = appointments
    .filter((a) => new Date(a.dateTime) >= now && a.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const nextAppointment = upcoming[0];

  const past = appointments
    .filter((a) => new Date(a.dateTime) < now || a.status === 'COMPLETED')
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    .slice(0, 5);

  return (
    <div>
      <h1 className="pat-greeting">Welcome back, {firstName}</h1>
      <p className="pat-date">{today}</p>

      {!loading && nextAppointment && (
        <div className="pat-banner">
          <div className="pat-banner-icon">
            <Icon name="calendar" size={20} strokeWidth={2} />
          </div>
          <div className="pat-banner-body">
            <div className="pat-banner-title">Upcoming Appointment</div>
            <div className="pat-banner-main">
              {new Date(nextAppointment.dateTime).toLocaleDateString(undefined, { weekday: 'long' })} at {new Date(nextAppointment.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} — Dr. {nextAppointment.doctor?.fullName} ({nextAppointment.doctor?.specialty || 'General'})
            </div>
            {nextAppointment.notes && <div className="pat-banner-sub">{nextAppointment.notes}</div>}
          </div>
          <button className="pat-banner-btn" onClick={() => navigate('/patient/records')}>View details</button>
        </div>
      )}

      <div className="pat-stat-grid">
        <div className="pat-stat-card">
          <div className="pat-stat-label">Total Appointments</div>
          <div className="pat-stat-value">{appointments.length}</div>
          <div className="pat-stat-sub">All time</div>
        </div>
        <div className="pat-stat-card">
          <div className="pat-stat-label">Upcoming</div>
          <div className="pat-stat-value" style={{ color: '#2563eb' }}>{upcoming.length}</div>
        </div>
        <div className="pat-stat-card">
          <div className="pat-stat-label">Active Prescriptions</div>
          <div className="pat-stat-value" style={{ color: '#059669' }}>{prescriptionCount}</div>
          <div className="pat-stat-sub">As of today</div>
        </div>
      </div>

      <div className="pat-panel">
        <div className="pat-panel-header-row">
          <span className="pat-panel-title">Recent Appointments</span>
          <button className="pat-view-all" onClick={() => navigate('/patient/records')}>View all</button>
        </div>

        {loading ? (
          <p className="pat-empty">Loading...</p>
        ) : past.length === 0 ? (
          <p className="pat-empty">No past appointments yet.</p>
        ) : (
          <table className="pat-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map((a) => {
                const status = statusMeta[a.status];
                return (
                  <tr key={a.id}>
                    <td>{new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>Dr. {a.doctor?.fullName}</td>
                    <td><span className={`pat-badge ${status.className}`}>{status.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}