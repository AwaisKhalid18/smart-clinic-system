const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const createLabTestSchema = z.object({
  patientId: z.number().int().positive(),
  medicalRecordId: z.number().int().positive().optional(),
  testType: z.string().min(1).max(200),
});

const updateStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'IN_PROGRESS', 'COMPLETED']),
});

const enterResultSchema = z.object({
  resultText: z.string().max(2000).optional(),
  resultFileUrl: z.string().url().max(500).optional(),
});

// Doctor requests a lab test for a patient
router.post('/', authenticate, authorize('DOCTOR'), async (req, res) => {
  try {
    const parsed = createLabTestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid lab test data' });
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

    const labTest = await prisma.labTest.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        medicalRecordId: parsed.data.medicalRecordId,
        testType: parsed.data.testType,
      },
    });

    res.status(201).json(labTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create lab test request' });
  }
});

// List lab tests — scoped by role
router.get('/', authenticate, async (req, res) => {
  try {
    let labTests;

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

      labTests = await prisma.labTest.findMany({
        where: { patientId: patient.id, status: 'COMPLETED' },
        include: { doctor: { select: { fullName: true, specialty: true } } },
        orderBy: { requestedAt: 'desc' },
      });
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

      labTests = await prisma.labTest.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { select: { fullName: true } } },
        orderBy: { requestedAt: 'desc' },
      });
    } else if (req.user.role === 'LAB') {
      labTests = await prisma.labTest.findMany({
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { fullName: true } },
        },
        orderBy: { requestedAt: 'desc' },
      });
    } else if (req.user.role === 'ADMIN') {
      labTests = await prisma.labTest.findMany({
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { fullName: true } },
        },
        orderBy: { requestedAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(labTests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
});

// Lab personnel updates status (e.g. move to IN_PROGRESS)
router.patch('/:id/status', authenticate, authorize('LAB'), async (req, res) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const testId = parseInt(req.params.id, 10);
    if (isNaN(testId)) {
      return res.status(400).json({ error: 'Invalid lab test id' });
    }

    const labTest = await prisma.labTest.findUnique({ where: { id: testId } });
    if (!labTest) {
      return res.status(404).json({ error: 'Lab test not found' });
    }

    const updated = await prisma.labTest.update({
      where: { id: testId },
      data: { status: parsed.data.status },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lab test status' });
  }
});

// Lab personnel enters results and marks the test completed
router.patch('/:id/result', authenticate, authorize('LAB'), async (req, res) => {
  try {
    const parsed = enterResultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid result data' });
    }

    const testId = parseInt(req.params.id, 10);
    if (isNaN(testId)) {
      return res.status(400).json({ error: 'Invalid lab test id' });
    }

    const labTest = await prisma.labTest.findUnique({ where: { id: testId } });
    if (!labTest) {
      return res.status(404).json({ error: 'Lab test not found' });
    }

    const updated = await prisma.labTest.update({
      where: { id: testId },
      data: {
        resultText: parsed.data.resultText,
        resultFileUrl: parsed.data.resultFileUrl,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to enter lab result' });
  }
});

// Get a single lab test by id — with ownership check
router.get('/:id', authenticate, async (req, res) => {
  try {
    const testId = parseInt(req.params.id, 10);
    if (isNaN(testId)) {
      return res.status(400).json({ error: 'Invalid lab test id' });
    }

    const labTest = await prisma.labTest.findUnique({
      where: { id: testId },
      include: {
        doctor: { select: { fullName: true, specialty: true } },
        patient: { select: { fullName: true } },
      },
    });

    if (!labTest) {
      return res.status(404).json({ error: 'Lab test not found' });
    }

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (!patient || labTest.patientId !== patient.id || labTest.status !== 'COMPLETED') {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (!doctor || labTest.doctorId !== doctor.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'LAB' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(labTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lab test' });
  }
});

module.exports = router;