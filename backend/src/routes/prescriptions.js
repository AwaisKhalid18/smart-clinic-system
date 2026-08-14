const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const prescriptionItemSchema = z.object({
  drugName: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  duration: z.string().min(1).max(100),
});

const createPrescriptionSchema = z.object({
  patientId: z.number().int().positive(),
  medicalRecordId: z.number().int().positive().optional(),
  items: z.array(prescriptionItemSchema).min(1).max(20),
});

// Doctor creates a prescription (with one or more items) for a patient
router.post('/', authenticate, authorize('DOCTOR'), async (req, res) => {
  try {
    const parsed = createPrescriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid prescription data' });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (parsed.data.medicalRecordId) {
      const record = await prisma.medicalRecord.findUnique({ where: { id: parsed.data.medicalRecordId } });
      if (!record || record.doctorId !== doctor.id || record.patientId !== patient.id) {
        return res.status(400).json({ error: 'Invalid medical record reference' });
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        medicalRecordId: parsed.data.medicalRecordId,
        items: {
          create: parsed.data.items,
        },
      },
      include: { items: true },
    });

    res.status(201).json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// List prescriptions — scoped by role
router.get('/', authenticate, async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

      prescriptions = await prisma.prescription.findMany({
        where: { patientId: patient.id },
        include: {
          items: true,
          doctor: { select: { fullName: true, specialty: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

      prescriptions = await prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        include: {
          items: true,
          patient: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'ADMIN') {
      prescriptions = await prisma.prescription.findMany({
        include: {
          items: true,
          doctor: { select: { fullName: true } },
          patient: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get a single prescription by id — with ownership check
router.get('/:id', authenticate, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id, 10);
    if (isNaN(prescriptionId)) {
      return res.status(400).json({ error: 'Invalid prescription id' });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: true,
        doctor: { select: { fullName: true, specialty: true } },
        patient: { select: { fullName: true } },
      },
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient || prescription.patientId !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor || prescription.doctorId !== doctor.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

module.exports = router;