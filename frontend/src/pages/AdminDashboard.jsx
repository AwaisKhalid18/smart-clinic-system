import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './AdminDashboard.css';

const statusMeta = {
  PENDING: { label: 'Scheduled', className: 'badge-scheduled' },
  CONFIRMED: { label: 'Confirmed', className: 'badge-confirmed' },
  CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, apptRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/appointments'),
        ]);
        setStats(statsRes.data);
        setAppointments(apptRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const todaysAppointments = appointments.filter(
    (a) => new Date(a.dateTime).toDateString() === new Date().toDateString()
  );
  const completedToday = todaysAppointments.filter((a) => a.status === 'COMPLETED').length;

  const upcoming = appointments
    .filter((a) => new Date(a.dateTime) > new Date() && a.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 3);

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-date">{today}</p>
        </div>
        <button className="admin-new-btn" onClick={() => navigate('/admin/create-staff')}>
          + Add Staff
        </button>
      </div>

      {loading ? (
        <p className="admin-empty">Loading...</p>
      ) : (
        <>
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Today's Appointments</div>
              <div className="admin-stat-value">{todaysAppointments.length}</div>
              <div className="admin-stat-sub">{completedToday} completed · {todaysAppointments.length - completedToday} remaining</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Active Patients</div>
              <div className="admin-stat-value" style={{ color: '#2563eb' }}>{stats.totalPatients}</div>
              <div className="admin-stat-sub">registered patients</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Active Doctors</div>
              <div className="admin-stat-value" style={{ color: '#059669' }}>{stats.totalDoctors}</div>
              <div className="admin-stat-sub">on staff</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Appointments</div>
              <div className="admin-stat-value">{stats.totalAppointments}</div>
              <div className="admin-stat-sub">all time</div>
            </div>
          </div>

          <div className="admin-columns">
            <div className="admin-panel">
              <div className="admin-panel-header-row">
                <span className="admin-panel-title">Today's Appointments</span>
              </div>

              {todaysAppointments.length === 0 ? (
                <p className="admin-empty">No appointments scheduled today.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map((a) => {
                      const status = statusMeta[a.status];
                      return (
                        <tr key={a.id}>
                          <td>{new Date(a.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>{a.patient?.fullName || '—'}</td>
                          <td>{a.doctor?.fullName || '—'}</td>
                          <td><span className={`admin-badge ${status.className}`}>{status.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header-row">
                <span className="admin-panel-title">Upcoming</span>
              </div>
              {upcoming.length === 0 ? (
                <p className="admin-empty">Nothing upcoming.</p>
              ) : (
                upcoming.map((a) => (
                  <div className="admin-upcoming-row" key={a.id}>
                    <div>
                      <div className="admin-upcoming-name">{a.patient?.fullName}</div>
                      <div className="admin-upcoming-date">
                        {new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(a.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="admin-upcoming-doctor">{a.doctor?.fullName}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}