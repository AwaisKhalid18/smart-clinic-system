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
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/lab/dashboard" element={<LabDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/patient/book-appointment" element={<BookAppointment />} />
        <Route path="/patient/records" element={<PatientRecords />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/patient/lab-results" element={<PatientLabResults />} />
         <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/lab-requests" element={<DoctorLabRequests />} />


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