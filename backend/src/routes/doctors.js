const express = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;