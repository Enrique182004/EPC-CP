const db = require("../config/database");

const create = ({
  doctor_id,
  event_type,
  google_event_id,
  calendar_owner,
  title,
  description,
  event_date,
}) =>
  db
    .prepare(
      `INSERT INTO calendar_events (doctor_id, event_type, google_event_id, calendar_owner, title, description, event_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      doctor_id,
      event_type,
      google_event_id || null,
      calendar_owner || null,
      title,
      description || null,
      event_date,
    );

const findByDoctor = (doctorId) =>
  db
    .prepare(
      "SELECT * FROM calendar_events WHERE doctor_id = ? ORDER BY event_date",
    )
    .all(doctorId);

const findAll = () =>
  db
    .prepare(
      "SELECT ce.*, d.first_name, d.last_name FROM calendar_events ce JOIN doctors d ON ce.doctor_id = d.id ORDER BY ce.event_date",
    )
    .all();

const update = (id, { google_event_id, title, description, event_date }) =>
  db
    .prepare(
      "UPDATE calendar_events SET google_event_id = ?, title = ?, description = ?, event_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(google_event_id || null, title, description || null, event_date, id);

const remove = (id) =>
  db.prepare("DELETE FROM calendar_events WHERE id = ?").run(id);

module.exports = { create, findByDoctor, findAll, update, remove };
