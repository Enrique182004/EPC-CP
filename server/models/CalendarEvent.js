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

const findAll = () =>
  db
    .prepare(
      "SELECT ce.*, d.first_name, d.last_name FROM calendar_events ce JOIN doctors d ON ce.doctor_id = d.id ORDER BY ce.event_date",
    )
    .all();

const findByOwner = (userId) =>
  db
    .prepare(
      "SELECT ce.*, d.first_name, d.last_name FROM calendar_events ce JOIN doctors d ON ce.doctor_id = d.id WHERE ce.calendar_owner = ? ORDER BY ce.event_date",
    )
    .all(String(userId));

const remove = (id) =>
  db.prepare("DELETE FROM calendar_events WHERE id = ?").run(id);

module.exports = { create, findAll, findByOwner, remove };
