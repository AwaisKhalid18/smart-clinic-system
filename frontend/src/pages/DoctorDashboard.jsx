import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './DoctorDashboard.css';

const statusClass = {
  PENDING: 'status-badge status-active',
  CONFIRMED: 'status-badge status-confirmed',
  CANCELLED: 'status-badge status-cancelled',
  COMPLETED: 'status-badge status-confirmed',
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

  const today = new Date().toDateString();
  const todaysAppointments = appointments.filter(
    (a) => new Date(a.dateTime).toDateString() === today
  );
  const cancellations = appointments.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-columns">
        <div className="main-col">
          <p className="greeting-eyebrow">Good morning, {user.email}</p>
          <h1 className="page-title">Today's Schedule</h1>

          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Total Appointments</div>
              <div className="stat-value">{appointments.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Today</div>
              <div className="stat-value">{todaysAppointments.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Cancellations</div>
              <div className="stat-value stat-danger">{cancellations}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">Upcoming Appointments</div>
            {loading ? (
              <p className="loading-text">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="empty-text">No appointments yet. They'll appear here once patients start booking.</p>
            ) : (
              <table className="appt-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{new Date(appt.dateTime).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}</td>
                      <td>
                        <div className="patient-cell">
                          <div className="avatar-sm">{appt.patient?.fullName?.charAt(0) || '?'}</div>
                          <div>
                            <div className="patient-name">{appt.patient?.fullName || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{appt.notes || '—'}</td>
                      <td>
                        <span className={statusClass[appt.status]}>{appt.status}</span>
                      </td>
                      <td>
                        {appt.status === 'PENDING' && (
                          <div className="appt-actions">
                            <button
                              className="appt-action-btn confirm"
                              disabled={updatingId === appt.id}
                              onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                            >
                              Confirm
                            </button>
                            <button
                              className="appt-action-btn cancel"
                              disabled={updatingId === appt.id}
                              onClick={() => updateStatus(appt.id, 'CANCELLED')}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {appt.status === 'CONFIRMED' && (
                          <div className="appt-actions">
                            <button
                              className="appt-action-btn confirm"
                              disabled={updatingId === appt.id}
                              onClick={() => updateStatus(appt.id, 'COMPLETED')}
                            >
                              Mark Completed
                            </button>
                            <button
                              className="appt-action-btn cancel"
                              disabled={updatingId === appt.id}
                              onClick={() => updateStatus(appt.id, 'CANCELLED')}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {(appt.status === 'COMPLETED' || appt.status === 'CANCELLED') && (
                          <span className="appt-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}