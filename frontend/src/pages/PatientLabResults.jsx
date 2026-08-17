import { useState, useEffect } from 'react';
import api from '../api/axios';
import './PatientListPages.css';

export default function PatientLabResults() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/lab-tests');
        setLabTests(res.data);
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
      <h1 className="page-title">Lab Results</h1>
      <p className="list-subtitle">Your completed diagnostic test results.</p>

      {loading ? (
        <p className="loading-text">Loading your results...</p>
      ) : labTests.length === 0 ? (
        <div className="panel"><p className="empty-text">No completed lab results yet. Results appear here once your lab work is finished.</p></div>
      ) : (
        <div className="record-list">
          {labTests.map((t) => (
            <div className="panel record-card" key={t.id}>
              <div className="record-card-header">
                <span className="record-diagnosis">{t.testType}</span>
                <span className="record-date">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="record-doctor">
                Ordered by Dr. {t.doctor?.fullName} · {t.doctor?.specialty || 'General'}
              </div>
              {t.resultText && <p className="record-notes">{t.resultText}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}