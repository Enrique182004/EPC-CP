const express = require('express');
const TdiApplication = require('../models/TdiApplication');
const Doctor = require('../models/Doctor');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/doctors/:id/tdi
router.get('/', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    TdiApplication.upsert(doctorId);
    const tdi = TdiApplication.findByDoctor(doctorId);
    res.json(tdi);
  } catch (err) { next(err); }
});

// PATCH /api/doctors/:id/tdi
router.patch('/', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const VALID_STATUSES = ['not_started','sent_to_doctor','signed','filed'];
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    TdiApplication.upsert(doctorId);
    TdiApplication.updateStatus(doctorId, { status, notes });

    // If signed, mark doctor's tdi_completed flag
    if (status === 'signed') {
      Doctor.update(doctorId, { tdi_completed: 1 });
    }

    res.json(TdiApplication.findByDoctor(doctorId));
  } catch (err) { next(err); }
});

module.exports = router;
