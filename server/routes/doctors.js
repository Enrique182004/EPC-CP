const express = require("express");
const Doctor = require("../models/Doctor");
const Workflow = require("../models/Workflow");
const Document = require("../models/Document");
const TdiApplication = require("../models/TdiApplication");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/doctors
router.get("/", authenticate, (req, res, next) => {
  try {
    const { search, status, workerId } = req.query;
    const doctors = Doctor.findAll({
      search,
      status,
      workerId: workerId ? parseInt(workerId) : undefined,
    });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

// POST /api/doctors
router.post("/", authenticate, requireRole("admin"), (req, res, next) => {
  try {
    const { first_name, last_name, ...rest } = req.body;
    if (!first_name || !last_name)
      return res.status(400).json({ error: "First and last name required" });
    const fields = { first_name, last_name, ...rest };
    const result = Doctor.create(fields);
    const doctor = Doctor.findById(result.lastInsertRowid);

    // Initialize workflow, documents, and TDI
    Workflow.createInstance(doctor.id);
    Document.ensureDocumentRows(doctor.id);
    TdiApplication.upsert(doctor.id);

    res.status(201).json(doctor);
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id
router.get("/:id", authenticate, (req, res, next) => {
  try {
    const doctor = Doctor.findById(parseInt(req.params.id));
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/doctors/:id
router.patch("/:id", authenticate, (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doctor = Doctor.findById(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    if (req.user.role !== "admin" && doctor.assigned_worker_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    Doctor.update(id, req.body);
    res.json(Doctor.findById(id));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/doctors/:id
router.delete("/:id", authenticate, requireRole("admin"), (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doctor = Doctor.findById(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    Doctor.remove(id);
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
