import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import LabDashboard from './pages/LabDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import './components/DashboardLayout.css';
import BookAppointment from './pages/BookAppointment';
import PatientRecords from './pages/PatientRecords';
import PatientPrescriptions from './pages/PatientPrescriptions';
import PatientLabResults from './pages/PatientLabResults';
import DoctorPatients from './pages/DoctorPatients';
import DoctorLabRequests from './pages/DoctorLabRequests';
import AdminCreateStaff from './pages/AdminCreateStaff';
import Notifications from './pages/Notifications';

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

<Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
  <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/lab/dashboard" element={<ProtectedRoute allowedRoles={['LAB']}><LabDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/patient/book-appointment" element={<ProtectedRoute allowedRoles={['PATIENT']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientRecords /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientPrescriptions /></ProtectedRoute>} />
        <Route path="/patient/lab-results" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientLabResults /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorPatients /></ProtectedRoute>} />
        <Route path="/doctor/lab-requests" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorLabRequests /></ProtectedRoute>} />
        <Route path="/admin/create-staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCreateStaff /></ProtectedRoute>} />
                <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === 'DOCTOR' ? '/doctor/dashboard' :
                user.role === 'PATIENT' ? '/patient/dashboard' :
                user.role === 'LAB' ? '/lab/dashboard' :
                '/admin/dashboard'
              }
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;