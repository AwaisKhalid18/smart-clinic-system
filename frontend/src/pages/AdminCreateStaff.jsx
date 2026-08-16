import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './AdminCreateStaff.css';

export default function AdminCreateStaff() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'DOCTOR',
    specialty: '',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/staff', {
        email: form.email,
        password: form.password,
        role: form.role,
        fullName: form.fullName,
        ...(form.role === 'DOCTOR' && form.specialty && { specialty: form.specialty }),
      });
      toast.success('Staff account created');
      setForm({ fullName: '', email: '', password: '', role: 'DOCTOR', specialty: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="staff-page">
      <h1 className="page-title">Create Staff Account</h1>
      <p className="list-subtitle">Add a new Doctor, Lab Personnel, or Admin account.</p>

      <div className="panel staff-form-panel">
        <form onSubmit={handleSubmit} className="staff-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="doctor-form-input"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              className="doctor-form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Temporary Password</label>
            <input
              className="doctor-form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              className="doctor-form-input"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="DOCTOR">Doctor</option>
              <option value="LAB">Lab Personnel</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {form.role === 'DOCTOR' && (
            <div className="form-group">
              <label>Specialty</label>
              <input
                className="doctor-form-input"
                name="specialty"
                placeholder="e.g. Cardiology"
                value={form.specialty}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="staff-submit-btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}