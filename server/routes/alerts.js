const express = require('express');
const AlertLog = require('../models/AlertLog');
const { authenticate, requireRole } = require('../middleware/auth');
const { checkExpirations } = require('../services/alertService');

const router = express.Router();

// GET /api/alerts
router.get('/', authenticate, (req, res, next) => {
  try {
    const { doctorId, limit } = req.query;
    const alerts = AlertLog.findAll({ doctorId: doctorId ? parseInt(doctorId) : undefined, limit: limit ? parseInt(limit) : 100 });
    res.json(alerts);
  } catch (err) { next(err); }
});

// GET /api/alerts/doctor/:id
router.get('/doctor/:id', authenticate, (req, res, next) => {
  try {
    const alerts = AlertLog.findAll({ doctorId: parseInt(req.params.id) });
    res.json(alerts);
  } catch (err) { next(err); }
});

// POST /api/alerts/trigger (admin only - manual trigger)
router.post('/trigger', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    await checkExpirations();
    res.json({ message: 'Alert check completed' });
  } catch (err) { next(err); }
});

module.exports = router;
