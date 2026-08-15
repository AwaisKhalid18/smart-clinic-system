import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './DoctorListPages.css';

const statusLabel = {
  REQUESTED: 'Pending',
  IN_PROGRESS: 'Processing',    
  COMPLETED: 'Completed',
};

export default function DoctorLabRequests() {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', testType: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [testsRes, patientsRes] = await Promise.all([
        api.get('/lab-tests'),
        api.get('/doctors/my-patients'),
      ]);
      setLabTests(testsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patientId || !form.testType) {
      toast.error('Select a patient and enter a test type');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/lab-tests', {
        patientId: parseInt(form.patientId, 10),
        testType: form.testType,
      });
      toast.success('Lab test requested');
      setForm({ patientId: '', testType: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request test');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="list-header-row">
        <div>
          <h1 className="page-title">Lab Requests</h1>
          <p className="list-subtitle">Tests you've requested for your patients.</p>
        </div>
        <button className="new-request-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <div className="panel" style={{ marginBottom: '1.25rem' }}>
          <form onSubmit={handleSubmit} className="lab-request-form">
            <div className="form-group">
              <label>Patient</label>
              <select
                className="form-input"
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                required
              >
                <option value="">Select a patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Test Type</label>
              <input
                className="form-input"
                placeholder="e.g. Complete Blood Count"
                value={form.testType}
                onChange={(e) => setForm({ ...form, testType: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="submit-request-btn" disabled={submitting}>
              {submitting ? 'Requesting...' : 'Request Test'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : labTests.length === 0 ? (
        <div className="panel"><p>No lab requests yet.</p></div>
      ) : (
        <div className="panel">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test Type</th>
                <th>Status</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((t) => (
                <tr key={t.id}>
                  <td>{t.patient?.fullName}</td>
                  <td>{t.testType}</td>
                  <td>{statusLabel[t.status]}</td>
                  <td>{new Date(t.requestedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}