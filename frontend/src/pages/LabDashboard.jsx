import './LabDashboard.css';

const testRequests = [
  { priority: 'Urgent', patient: 'Sarah Miller', id: 'PT-9012', testType: 'Complete Blood Count', status: 'Pending', collected: 'Oct 24, 08:30 AM', action: 'Input Results' },
  { priority: 'Routine', patient: 'James Chen', id: 'PT-8841', testType: 'Lipid Profile', status: 'Processing', collected: 'Oct 24, 09:15 AM', action: 'Verify' },
  { priority: 'Routine', patient: 'Elena Rodriguez', id: 'PT-7622', testType: 'Urinalysis', status: 'Completed', collected: 'Oct 23, 14:20 PM', action: 'Verify' },
  { priority: 'Urgent', patient: 'Michael Chang', id: 'PT-9105', testType: 'Comprehensive Metabolic Panel', status: 'Pending', collected: 'Oct 24, 10:05 AM', action: 'Input Results' },
];

const criticalAlerts = [
  { name: 'David Thompson', time: '15m ago', detail: 'Troponin I High: >0.04 ng/mL' },
  { name: 'Amelia Earhart', time: '1h ago', detail: 'Potassium Critical: 6.8 mmol/L' },
  { name: 'Robert Kraft', time: '2h ago', detail: 'WBC Count Low: 2.1 ×10⁹/L' },
];

const statusClass = {
  Pending: 'lab-status pending',
  Processing: 'lab-status processing',
  Completed: 'lab-status completed',
};

export default function LabDashboard() {
  return (
    <div className="lab-dashboard">
      <h1 className="page-title">Lab Results Management</h1>
      <p className="lab-subtitle">Process and verify patient diagnostic tests.</p>

      <div className="lab-stat-row">
        <div className="lab-stat-card">
          <div className="stat-label">Pending Tests</div>
          <div className="stat-value">42 <span className="urgent-tag">12 Urgent</span></div>
        </div>
        <div className="lab-stat-card">
          <div className="stat-label">Completed Today</div>
          <div className="stat-value">128</div>
        </div>
        <div className="lab-stat-card">
          <div className="stat-label">Avg Turnaround</div>
          <div className="stat-value">4.2h</div>
        </div>
        <div className="lab-stat-card danger-card">
          <div className="stat-label">⚠ Critical Flags</div>
          <div className="stat-value stat-danger">3</div>
        </div>
      </div>

      <div className="lab-columns">
        <div className="panel">
          <div className="lab-table-toolbar">
            <input className="lab-search" placeholder="Search by Patient, ID, or Test..." />
            <button className="toolbar-btn">Filter</button>
            <button className="toolbar-btn">Sort</button>
          </div>

          <table className="lab-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Patient</th>
                <th>Test Type</th>
                <th>Status</th>
                <th>Collected Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testRequests.map((t, i) => (
                <tr key={i}>
                  <td>
                    <span className={`priority-badge ${t.priority === 'Urgent' ? 'urgent' : 'routine'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <div className="lab-patient-name">{t.patient}</div>
                    <div className="lab-patient-id">{t.id}</div>
                  </td>
                  <td>{t.testType}</td>
                  <td><span className={statusClass[t.status]}>● {t.status}</span></td>
                  <td>{t.collected}</td>
                  <td><button className="lab-action-btn">{t.action}</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lab-table-footer">
            <span>Showing 1-4 of 42 results</span>
            <div className="pagination">
              <button className="page-btn">←</button>
              <span>Page 1 of 11</span>
              <button className="page-btn">→</button>
            </div>
          </div>
        </div>

        <div className="panel critical-panel">
          <div className="panel-header-row">
            <span className="panel-header">⚠ Critical Action Req.</span>
          </div>
          {criticalAlerts.map((alert, i) => (
            <div className="critical-row" key={i}>
              <div className="critical-top">
                <span className="critical-name">{alert.name}</span>
                <span className="critical-time">{alert.time}</span>
              </div>
              <div className="critical-detail">{alert.detail}</div>
              <button className="notify-btn">Notify Clinician</button>
            </div>
          ))}
          <button className="view-all-btn">View All Flags</button>
        </div>
      </div>
    </div>
  );
}