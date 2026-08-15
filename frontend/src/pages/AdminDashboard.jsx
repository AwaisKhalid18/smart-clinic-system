import { useState, useEffect } from 'react';
import api from '../api/axios';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, patientsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/patients'),
        ]);
        setStats(statsRes.data);
        setPatients(patientsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.user.createdAt) - new Date(a.user.createdAt))
    .slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="admin-subtitle">Today's clinic performance metrics.</p>
        </div>
        <input className="admin-search" placeholder="Search patients, doctors..." />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="admin-stat-row">
            <div className="admin-stat-card">
              <div className="stat-label">Appointments Today</div>
              <div className="stat-value">{stats.appointmentsToday}</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Active Doctors</div>
              <div className="stat-value">{stats.totalDoctors}</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Total Patients</div>
              <div className="stat-value">{stats.totalPatients}</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Total Appointments</div>
              <div className="stat-value">{stats.totalAppointments}</div>
            </div>
          </div>

          <div className="admin-columns">
            <div className="panel volume-panel">
              <div className="panel-header-row">
                <div>
                  <div className="panel-header">Clinic Overview</div>
                  <div className="panel-subheader">Summary of current clinic activity.</div>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Detailed volume charts will appear here once appointment history builds up over time.
              </p>
            </div>

            <div className="panel registrations-panel">
              <div className="panel-header-row">
                <span className="panel-header">Recent Registrations</span>
              </div>
              {recentPatients.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No patients registered yet.</p>
              ) : (
                recentPatients.map((p) => (
                  <div className="registration-row" key={p.id}>
                    <div className="reg-avatar">{p.fullName.charAt(0)}</div>
                    <div className="reg-body">
                      <div className="reg-name">{p.fullName}</div>
                      <div className="reg-meta">{p.user.email}</div>
                    </div>
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