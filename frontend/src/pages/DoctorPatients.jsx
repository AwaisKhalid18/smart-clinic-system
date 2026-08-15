import { useState, useEffect } from 'react';
import api from '../api/axios';
import './DoctorListPages.css';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/doctors/my-patients');
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">My Patients</h1>
      <p className="list-subtitle">Patients you have seen or have upcoming appointments with.</p>

      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <div className="panel"><p>No patients yet.</p></div>
      ) : (
        <div className="panel">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="patient-cell">
                      <div className="avatar-sm">{p.fullName.charAt(0)}</div>
                      <div className="patient-name">{p.fullName}</div>
                    </div>
                  </td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}