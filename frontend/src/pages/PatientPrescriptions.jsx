    import { useState, useEffect } from 'react';
import api from '../api/axios';
import './PatientListPages.css';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/prescriptions');
        setPrescriptions(res.data);
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
      <h1 className="page-title">Prescriptions</h1>
      <p className="list-subtitle">Medications prescribed by your doctors.</p>

      {loading ? (
        <p>Loading...</p>
      ) : prescriptions.length === 0 ? (
        <div className="panel"><p>No prescriptions yet.</p></div>
      ) : (
        <div className="record-list">
          {prescriptions.map((p) => (
            <div className="panel record-card" key={p.id}>
              <div className="record-card-header">
                <span className="record-diagnosis">
                  Dr. {p.doctor?.fullName} · {p.doctor?.specialty || 'General'}
                </span>
                <span className="record-date">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <table className="rx-table">
                <thead>
                  <tr>
                    <th>Drug</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {p.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.drugName}</td>
                      <td>{item.dosage}</td>
                      <td>{item.frequency}</td>
                      <td>{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}