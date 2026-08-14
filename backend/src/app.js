const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const doctorRoutes = require('./routes/doctors');
const medicalRecordRoutes = require('./routes/medicalRecords');
const prescriptionRoutes = require('./routes/prescriptions');


const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SCMS API running' });
});

module.exports = app;