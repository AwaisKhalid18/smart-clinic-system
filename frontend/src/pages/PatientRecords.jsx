import { useState, useEffect } from 'react';
import api from '../api/axios';
import './PatientListPages.css';

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/medical-records');
        setRecords(res.data);
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
      <h1 className="page-title">Medical Records</h1>
      <p className="list-subtitle">Your diagnosis history and doctor's notes.</p>

     {loading ? (
        <p className="loading-text">Loading your records...</p>
      ) : records.length === 0 ? (
        <div className="panel"><p className="empty-text">No medical records yet. Your doctor will add entries after your visits.</p></div>
      ) : (
        <div className="record-list">
          {records.map((r) => (
            <div className="panel record-card" key={r.id}>
              <div className="record-card-header">
                <span className="record-diagnosis">{r.diagnosis}</span>
                <span className="record-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="record-doctor">
                Dr. {r.doctor?.fullName} · {r.doctor?.specialty || 'General'}
              </div>
              {r.notes && <p className="record-notes">{r.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}