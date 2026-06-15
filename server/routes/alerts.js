const express = require("express");
const db = require("../config/database");
const AlertLog = require("../models/AlertLog");
const { authenticate, requireRole } = require("../middleware/auth");
const { checkExpirations } = require("../services/alertService");

const router = express.Router();

// GET /api/alerts
router.get("/", authenticate, requireRole("admin"), (req, res, next) => {
  try {
    const { doctorId, limit } = req.query;
    const alerts = AlertLog.findAll({
      doctorId: doctorId ? parseInt(doctorId) : undefined,
      limit: Math.min(parseInt(limit) || 100, 500),
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// GET /api/alerts/doctor/:id
router.get("/doctor/:id", authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctor = db
      .prepare("SELECT assigned_worker_id FROM doctors WHERE id = ?")
      .get(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    if (req.user.role !== "admin" && doctor.assigned_worker_id !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    const alerts = AlertLog.findAll({ doctorId });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// POST /api/alerts/trigger (admin only - manual trigger)
router.post(
  "/trigger",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      await checkExpirations();
      res.json({ message: "Alert check completed" });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
