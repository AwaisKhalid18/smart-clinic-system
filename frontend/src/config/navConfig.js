export const navConfig = {
  DOCTOR: [
    { label: 'Dashboard', path: '/doctor/dashboard' },
    { label: 'Patients', path: '/doctor/patients' },
    { label: 'Lab Requests', path: '/doctor/lab-requests' },
    { label: 'Notifications', path: '/notifications' },
  ],
  PATIENT: [
    { label: 'Dashboard', path: '/patient/dashboard' },
    { label: 'Medical Records', path: '/patient/records' },
    { label: 'Prescriptions', path: '/patient/prescriptions' },
    { label: 'Lab Results', path: '/patient/lab-results' },
    { label: 'Notifications', path: '/notifications' },
  ],
  LAB: [
    { label: 'Dashboard', path: '/lab/dashboard' },
    { label: 'Notifications', path: '/notifications' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Create Staff', path: '/admin/create-staff' },
    { label: 'Billing', path: '/admin/billing' },
    { label: 'Notifications', path: '/notifications' },
  ],
};