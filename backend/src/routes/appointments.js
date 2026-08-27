const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');


const router = express.Router();

const createAppointmentSchema = z.object({
  doctorId: z.number().int().positive(),
  dateTime: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

// Patient books an appointment
router.post('/', authenticate, authorize('PATIENT'), async (req, res) => {
  try {
    const parsed = createAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid appointment data' });
    }

    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: parsed.data.doctorId } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        dateTime: new Date(parsed.data.dateTime),
        notes: parsed.data.notes,
      },
    });

    await createNotification(
      doctor.userId,
      'New Appointment Request',
      `${patient.fullName} booked an appointment for ${new Date(appointment.dateTime).toLocaleString()}.`
    );

    res.status(201).json(appointment);

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// List appointments — scoped to the logged-in user's own role
router.get('/', authenticate, async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { doctor: { select: { fullName: true, specialty: true } } },
        orderBy: { dateTime: 'asc' },
      });
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { select: { fullName: true } } },
        orderBy: { dateTime: 'asc' },
      });
    } else if (req.user.role === 'ADMIN') {
      appointments = await prisma.appointment.findMany({
        include: {
          doctor: { select: { fullName: true } },
          patient: { select: { fullName: true } },
        },
        orderBy: { dateTime: 'asc' },
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status — doctor or admin only, and doctor must own it
router.patch('/:id', authenticate, authorize('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const appointmentId = parseInt(req.params.id, 10);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment id' });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor || appointment.doctorId !== doctor.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: parsed.data.status },
      include: { patient: true },
    });

     await createNotification(
      updated.patient.userId,
      'Appointment Update',
      `Your appointment on ${new Date(updated.dateTime).toLocaleString()} is now ${updated.status.toLowerCase()}.`,
      updated.status === 'CANCELLED' ? 'HIGH' : 'NORMAL'
    );

    res.json(updated);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

module.exports = router;