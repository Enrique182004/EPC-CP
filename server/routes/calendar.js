const express = require("express");
const CalendarEvent = require("../models/CalendarEvent");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const {
  getAuthUrl,
  exchangeCode,
  verifyState,
} = require("../config/googleCalendar");
const { createEvent, deleteEvent } = require("../services/calendarService");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/calendar/oauth/url
router.get("/oauth/url", authenticate, (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: "Google Calendar not configured" });
  }
  res.json({ url: getAuthUrl(req.user.id) });
});

// GET /api/calendar/oauth/callback
router.get("/oauth/callback", async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send("Missing code or state");
    const userId = verifyState(state);
    if (!userId) return res.status(400).send("Invalid state parameter");
    const tokens = await exchangeCode(code);
    if (tokens.refresh_token) {
      User.updateGoogleToken(userId, tokens.refresh_token);
    }
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}?calendarConnected=1`,
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/calendar/events
router.get("/events", authenticate, (req, res, next) => {
  try {
    const events =
      req.user.role === "admin"
        ? CalendarEvent.findAll()
        : CalendarEvent.findByOwner(req.user.id);
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// POST /api/calendar/events
router.post("/events", authenticate, async (req, res, next) => {
  try {
    const { doctorId, event_type, title, description, event_date } = req.body;
    if (!doctorId || !title || !event_date)
      return res
        .status(400)
        .json({ error: "doctorId, title, and event_date required" });
    if (typeof title === "string" && title.length > 255)
      return res
        .status(400)
        .json({ error: "title must be 255 characters or fewer" });
    const doctor = Doctor.findById(parseInt(doctorId));
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    if (req.user.role !== "admin" && doctor.assigned_worker_id !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    const result = await createEvent({
      userId: req.user.id,
      doctorId,
      event_type: event_type || "custom",
      title,
      description,
      event_date,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/calendar/events/:id
router.delete("/events/:id", authenticate, async (req, res, next) => {
  try {
    await deleteEvent(parseInt(req.params.id), req.user.id, req.user.role);
    res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
