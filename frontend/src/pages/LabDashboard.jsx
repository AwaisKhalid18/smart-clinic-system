import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Icon from '../components/Icon';
import './LabDashboard.css';

const statusMeta = {
  REQUESTED: { label: 'Pending', className: 'badge-pending' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-progress' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
};

const avatarColors = ['#dc2626', '#7c3aed', '#059669', '#2563eb', '#db2777', '#d97706'];

function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const pendingCount = labTests.filter((t) => t.status === 'REQUESTED').length;
  const inProgressCount = labTests.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTodayCount = labTests.filter((t) => {
    if (t.status !== 'COMPLETED' || !t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === new Date().toDateString();
  }).length;

  const recentTests = [...labTests].slice(0, 5);

  return (
    <div>
      <div className="lab-header-row">
        <div>
          <h1 className="lab-title">Lab Dashboard</h1>
          <p className="lab-date">{today}</p>
        </div>
      </div>

      <div className="lab-stat-grid">
        <div className="lab-stat-card">
          <div className="lab-stat-label">Pending Tests</div>
          <div className="lab-stat-value">{pendingCount}</div>
          <div className="lab-stat-sub">awaiting processing</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-label">In Progress</div>
          <div className="lab-stat-value" style={{ color: '#1d4ed8' }}>{inProgressCount}</div>
          <div className="lab-stat-sub">being processed</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-label">Completed Today</div>
          <div className="lab-stat-value" style={{ color: '#059669' }}>{completedTodayCount}</div>
          <div className="lab-stat-sub">results submitted</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-label">Total Tests</div>
          <div className="lab-stat-value">{labTests.length}</div>
          <div className="lab-stat-sub">all time</div>
        </div>
      </div>

      <div className="lab-panel">
        <div className="lab-panel-header">
          <span className="lab-panel-title">All Test Requests</span>
        </div>

        {loading ? (
          <p className="lab-empty">Loading...</p>
        ) : labTests.length === 0 ? (
          <p className="lab-empty">No lab test requests yet.</p>
        ) : (
          <table className="lab-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test Type</th>
                <th>Ordered By</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((t) => {
                const status = statusMeta[t.status];
                const name = t.patient?.fullName || 'Unknown';
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="lab-patient-cell">
                        <div className="lab-avatar" style={{ background: colorForName(name) }}>
                          {name.charAt(0)}
                        </div>
                        {name}
                      </div>
                    </td>
                    <td>{t.testType}</td>
                    <td className="lab-muted">{t.doctor?.fullName || '—'}</td>
                    <td><span className={`lab-badge ${status.className}`}>{status.label}</span></td>
                    <td className="lab-muted">{new Date(t.requestedAt).toLocaleDateString()}</td>
                    <td>
                      {t.status === 'REQUESTED' && (
                        <button className="lab-btn" onClick={() => startProcessing(t.id)}>
                          Start Processing
                        </button>
                      )}
                      {t.status === 'IN_PROGRESS' && activeInputId !== t.id && (
                        <button className="lab-btn" onClick={() => setActiveInputId(t.id)}>
                          Input Results
                        </button>
                      )}
                      {t.status === 'IN_PROGRESS' && activeInputId === t.id && (
                        <div className="lab-input-row">
                          <input
                            className="lab-input"
                            placeholder="Enter result..."
                            value={resultInput[t.id] || ''}
                            onChange={(e) => setResultInput({ ...resultInput, [t.id]: e.target.value })}
                          />
                          <button className="lab-btn" onClick={() => submitResult(t.id)}>Submit</button>
                        </div>
                      )}
                      {t.status === 'COMPLETED' && (
                        <span className="lab-muted lab-result-text">{t.resultText}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}