import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './DoctorDashboard.css';

const statusMeta = {
  PENDING: { label: 'Scheduled', className: 'badge-scheduled' },
  CONFIRMED: { label: 'Confirmed', className: 'badge-confirmed' },
  CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      await api.patch(`/appointments/${id}`, { status });
      toast.success(`Appointment marked ${status.toLowerCase()}`);
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const todaysAppointments = appointments.filter(
    (a) => new Date(a.dateTime).toDateString() === new Date().toDateString()
  );
  const completedToday = todaysAppointments.filter((a) => a.status === 'COMPLETED').length;
  const remainingToday = todaysAppointments.length - completedToday;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeekCount = appointments.filter((a) => new Date(a.dateTime) >= startOfWeek).length;

  const upcoming = appointments
    .filter((a) => new Date(a.dateTime) > new Date() && a.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 4);

  return (
    <div>
      <h1 className="doc-greeting">Good morning, {user.email.split('@')[0]}</h1>
      <p className="doc-date">{today}</p>

      <div className="doc-stat-grid">
        <div className="doc-stat-card">
          <div className="doc-stat-label">Today's Patients</div>
          <div className="doc-stat-value">{todaysAppointments.length}</div>
        </div>
        <div className="doc-stat-card">
          <div className="doc-stat-label">Completed</div>
          <div className="doc-stat-value" style={{ color: '#059669' }}>{completedToday}</div>
        </div>
        <div className="doc-stat-card">
          <div className="doc-stat-label">Remaining</div>
          <div className="doc-stat-value" style={{ color: '#2563eb' }}>{remainingToday}</div>
        </div>
        <div className="doc-stat-card">
          <div className="doc-stat-label">This Week</div>
          <div className="doc-stat-value">{thisWeekCount}</div>
          <div className="doc-stat-sub">appointments</div>
        </div>
      </div>

      <div className="doc-columns">
        <div className="doc-panel">
          <div className="doc-panel-header-row">
            <span className="doc-panel-title">Today's Schedule</span>
          </div>

          {loading ? (
            <p className="doc-empty">Loading...</p>
          ) : todaysAppointments.length === 0 ? (
            <p className="doc-empty">No appointments today.</p>
          ) : (
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todaysAppointments.map((a) => {
                  const status = statusMeta[a.status];
                  return (
                    <tr key={a.id}>
                      <td>{new Date(a.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{a.patient?.fullName || 'Unknown'}</td>
                      <td><span className={`doc-badge ${status.className}`}>{status.label}</span></td>
                      <td>
                        {a.status === 'PENDING' && (
                          <div className="doc-actions">
                            <button className="doc-btn confirm" disabled={updatingId === a.id} onClick={() => updateStatus(a.id, 'CONFIRMED')}>Confirm</button>
                            <button className="doc-btn cancel" disabled={updatingId === a.id} onClick={() => updateStatus(a.id, 'CANCELLED')}>Cancel</button>
                          </div>
                        )}
                        {a.status === 'CONFIRMED' && (
                          <div className="doc-actions">
                            <button className="doc-btn confirm" disabled={updatingId === a.id} onClick={() => updateStatus(a.id, 'COMPLETED')}>Complete</button>
                            <button className="doc-btn cancel" disabled={updatingId === a.id} onClick={() => updateStatus(a.id, 'CANCELLED')}>Cancel</button>
                          </div>
                        )}
                        {(a.status === 'COMPLETED' || a.status === 'CANCELLED') && <span className="doc-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="doc-panel">
          <div className="doc-panel-header-row">
            <span className="doc-panel-title">Upcoming Appointments</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="doc-empty">Nothing upcoming.</p>
          ) : (
            upcoming.map((a) => {
              const status = statusMeta[a.status];
              return (
                <div className="doc-upcoming-row" key={a.id}>
                  <div>
                    <div className="doc-upcoming-name">{a.patient?.fullName}</div>
                    <div className="doc-upcoming-date">
                      {new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(a.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`doc-badge ${status.className}`}>{status.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}