const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        fullName: true,
        specialty: true,
      },
      orderBy: { fullName: 'asc' },
    });

    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Doctor's own patient list — derived from patients they have appointments with
router.get('/my-patients', authenticate, authorize('DOCTOR'), async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      select: {
        patient: {
          select: { id: true, fullName: true, dateOfBirth: true, phone: true },
        },
      },
      distinct: ['patientId'],
    });

    const patients = appointments.map((a) => a.patient);

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

module.exports = router;  