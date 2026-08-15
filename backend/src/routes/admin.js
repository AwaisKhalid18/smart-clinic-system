const express = require('express');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['ADMIN', 'DOCTOR', 'LAB']),
  fullName: z.string().min(1).max(200),
  specialty: z.string().max(200).optional(),
});

// Admin creates a staff account (Doctor, Lab, or another Admin)
router.post('/staff', async (req, res) => {
  try {
    const parsed = createStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid staff account data' });
    }

    const { email, password, role, fullName, specialty } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        ...(role === 'DOCTOR' && { doctor: { create: { fullName, specialty } } }),
        ...(role === 'LAB' && { labStaff: { create: { fullName } } }),
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create staff account' });
  }
});

// List all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        fullName: true,
        specialty: true,
        phone: true,
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { fullName: 'asc' },
    });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// List all patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        dateOfBirth: true,
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { fullName: 'asc' },
    });
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// List all lab personnel
router.get('/lab-staff', async (req, res) => {
  try {
    const labStaff = await prisma.labPersonnel.findMany({
      select: {
        id: true,
        fullName: true,
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { fullName: 'asc' },
    });
    res.json(labStaff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lab staff' });
  }
});

// Basic clinic stats for the dashboard
router.get('/stats', async (req, res) => {
  try {
    const [totalDoctors, totalPatients, totalAppointments, appointmentsToday] = await Promise.all([
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          dateTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    res.json({ totalDoctors, totalPatients, totalAppointments, appointmentsToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch clinic stats' });
  }
});

module.exports = router;