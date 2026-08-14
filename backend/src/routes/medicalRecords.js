const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const createRecordSchema = z.object({
  patientId: z.number().int().positive(),
  diagnosis: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
});

// Doctor creates a medical record for a patient
router.post('/', authenticate, authorize('DOCTOR'), async (req, res) => {
  try {
    const parsed = createRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid medical record data' });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: parsed.data.diagnosis,
        notes: parsed.data.notes,
      },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// List medical records — scoped by role, same ownership pattern as appointments
router.get('/', authenticate, async (req, res) => {
  try {
    let records;

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

      records = await prisma.medicalRecord.findMany({
        where: { patientId: patient.id },
        include: { doctor: { select: { fullName: true, specialty: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

      records = await prisma.medicalRecord.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'ADMIN') {
      records = await prisma.medicalRecord.findMany({
        include: {
          doctor: { select: { fullName: true } },
          patient: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Get a single record by id — with ownership check
router.get('/:id', authenticate, async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    if (isNaN(recordId)) {
      return res.status(400).json({ error: 'Invalid record id' });
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: {
        doctor: { select: { fullName: true, specialty: true } },
        patient: { select: { fullName: true } },
      },
    });

    if (!record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient || record.patientId !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor || record.doctorId !== doctor.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
});

module.exports = router;