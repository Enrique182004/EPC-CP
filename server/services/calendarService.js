const { getCalendar } = require("../config/googleCalendar");
const CalendarEvent = require("../models/CalendarEvent");
const { findByIdWithToken } = require("../models/User");

async function createEvent({
  userId,
  doctorId,
  event_type,
  title,
  description,
  event_date,
}) {
  const user = findByIdWithToken(userId);
  let googleEventId = null;

  if (user && user.google_refresh_token && process.env.GOOGLE_CLIENT_ID) {
    try {
      const calendar = getCalendar(user.google_refresh_token);
      const event = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: title,
          description,
          start: { date: event_date },
          end: { date: event_date },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 * 7 },
              { method: "popup", minutes: 24 * 60 },
            ],
          },
        },
      });
      googleEventId = event.data.id;
    } catch (err) {
      console.error(
        "[CalendarService] Failed to create Google event:",
        err.message,
      );
    }
  }

  const result = CalendarEvent.create({
    doctor_id: doctorId,
    event_type,
    google_event_id: googleEventId,
    calendar_owner: String(userId),
    title,
    description,
    event_date,
  });

  return { id: result.lastInsertRowid, googleEventId };
}

async function deleteEvent(eventId, userId) {
  const db = require("../config/database");
  const ce = db
    .prepare("SELECT * FROM calendar_events WHERE id = ?")
    .get(eventId);
  if (!ce) return;

  if (String(ce.calendar_owner) !== String(userId)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  if (ce.google_event_id && userId) {
    const user = findByIdWithToken(userId);
    if (user && user.google_refresh_token) {
      try {
        const calendar = getCalendar(user.google_refresh_token);
        await calendar.events.delete({
          calendarId: "primary",
          eventId: ce.google_event_id,
        });
      } catch (err) {
        console.error(
          "[CalendarService] Failed to delete Google event:",
          err.message,
        );
      }
    }
  }
  CalendarEvent.remove(eventId);
}

module.exports = { createEvent, deleteEvent };
