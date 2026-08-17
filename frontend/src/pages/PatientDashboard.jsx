import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user.email.split('@')[0];
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    loadAppointments();
  }, []);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => new Date(a.dateTime) >= now && a.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const nextAppointment = upcoming[0];

  return (
    <div className="patient-dashboard">
      <h1 className="patient-greeting">Hello, {firstName}</h1>
      <p className="patient-subtitle">Here is an overview of your care plan.</p>

      <div className="patient-columns">
        <div className="patient-main-col">
          <div className="panel next-appt-panel">
            <div className="panel-header-row">
              <span className="panel-header">Your Next Appointment</span>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : !nextAppointment ? (
              <p>No upcoming appointments booked.</p>
            ) : (
              <>
                <span className="confirmed-chip">{nextAppointment.status}</span>

                <div className="appt-detail-row">
                  <div className="appt-icon">📅</div>
                  <div>
                    <div className="appt-detail-title">
                      {new Date(nextAppointment.dateTime).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </div>
                    <div className="appt-detail-sub">
                      {new Date(nextAppointment.dateTime).toLocaleTimeString(undefined, {
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="appt-provider">
                    <div className="provider-avatar">
                      {nextAppointment.doctor?.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="appt-detail-title">{nextAppointment.doctor?.fullName}</div>
                      <div className="appt-detail-sub">{nextAppointment.doctor?.specialty || 'General'}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="patient-side-col">
          <button className="side-action-btn primary" onClick={() => navigate('/patient/book-appointment')}>
            <span className="side-action-title">Book New Appointment</span>
            <span className="side-action-sub">Find a time that works</span>
          </button>

<button className="side-action-btn" onClick={() => navigate('/patient/lab-results')}>
            <span className="side-action-title">View Test Results</span>
            <span className="side-action-sub">See your lab results</span>
          </button>
        </div>
      </div>
    </div>
  );
}