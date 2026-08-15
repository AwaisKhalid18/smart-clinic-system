import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './LabDashboard.css';

const statusClass = {
  REQUESTED: 'lab-status pending',
  IN_PROGRESS: 'lab-status processing',
  COMPLETED: 'lab-status completed',
};

const statusLabel = {
  REQUESTED: 'Pending',
  IN_PROGRESS: 'Processing',
  COMPLETED: 'Completed',
};

export default function LabDashboard() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultInput, setResultInput] = useState({});
  const [activeInputId, setActiveInputId] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      const res = await api.get('/lab-tests');
      setLabTests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function startProcessing(id) {
    try {
      await api.patch(`/lab-tests/${id}/status`, { status: 'IN_PROGRESS' });
      toast.success('Test marked as processing');
      loadTests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  }

  async function submitResult(id) {
    const text = resultInput[id];
    if (!text || !text.trim()) {
      toast.error('Enter a result before submitting');
      return;
    }
    try {
      await api.patch(`/lab-tests/${id}/result`, { resultText: text });
      toast.success('Result submitted');
      setActiveInputId(null);
      loadTests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit result');
    }
  }

  const pendingCount = labTests.filter((t) => t.status !== 'COMPLETED').length;
  const completedTodayCount = labTests.filter((t) => {
    if (t.status !== 'COMPLETED' || !t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="lab-dashboard">
      <h1 className="page-title">Lab Results Management</h1>
      <p className="lab-subtitle">Process and verify patient diagnostic tests.</p>

      <div className="lab-stat-row">
        <div className="lab-stat-card">
          <div className="stat-label">Pending Tests</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="lab-stat-card">
          <div className="stat-label">Completed Today</div>
          <div className="stat-value">{completedTodayCount}</div>
        </div>
        <div className="lab-stat-card">
          <div className="stat-label">Total Tests</div>
          <div className="stat-value">{labTests.length}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header-row">
          <span className="panel-header">All Test Requests</span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : labTests.length === 0 ? (
          <p>No lab test requests yet.</p>
        ) : (
          <table className="lab-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test Type</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="lab-patient-name">{t.patient?.fullName || 'Unknown'}</div>
                  </td>
                  <td>{t.testType}</td>
                  <td><span className={statusClass[t.status]}>● {statusLabel[t.status]}</span></td>
                  <td>{new Date(t.requestedAt).toLocaleDateString()}</td>
                  <td>
                    {t.status === 'REQUESTED' && (
                      <button className="lab-action-btn" onClick={() => startProcessing(t.id)}>
                        Start Processing
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && activeInputId !== t.id && (
                      <button className="lab-action-btn" onClick={() => setActiveInputId(t.id)}>
                        Input Results
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && activeInputId === t.id && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          className="lab-search"
                          placeholder="Enter result..."
                          value={resultInput[t.id] || ''}
                          onChange={(e) => setResultInput({ ...resultInput, [t.id]: e.target.value })}
                        />
                        <button className="lab-action-btn" onClick={() => submitResult(t.id)}>
                          Submit
                        </button>
                      </div>
                    )}
                    {t.status === 'COMPLETED' && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.resultText}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}