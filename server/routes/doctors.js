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
    // Workers can only see their own assigned doctors; ignore client-supplied workerId
    const effectiveWorkerId =
      req.user.role === "admin"
        ? workerId
          ? parseInt(workerId)
          : undefined
        : req.user.id;
    const doctors = Doctor.findAll({
      search,
      status,
      workerId: effectiveWorkerId,
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
    if (rest.npi && !/^\d{10}$/.test(rest.npi))
      return res.status(400).json({ error: "NPI must be exactly 10 digits" });
    if (rest.caqh_id && !/^\d{1,9}$/.test(rest.caqh_id))
      return res.status(400).json({ error: "CAQH ID must be up to 9 digits" });
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
    if (req.user.role !== "admin" && doctor.assigned_worker_id !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
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
    if (
      req.user.role !== "admin" &&
      doctor.assigned_worker_id !== req.user.id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const update = { ...req.body };
    if (update.npi && !/^\d{10}$/.test(update.npi))
      return res.status(400).json({ error: "NPI must be exactly 10 digits" });
    if (update.caqh_id && !/^\d{1,9}$/.test(update.caqh_id))
      return res.status(400).json({ error: "CAQH ID must be up to 9 digits" });
    if (req.user.role !== "admin") {
      delete update.credentialing_status;
      delete update.assigned_worker_id;
    }
    Doctor.update(id, update);
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
