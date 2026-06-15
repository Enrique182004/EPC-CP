const db = require("../config/database");

const wasAlertSent = (doctorId, alertType, subjectId) => {
  if (subjectId == null) {
    return !!db
      .prepare(
        `SELECT id FROM alert_log WHERE doctor_id = ? AND alert_type = ? AND subject_id IS NULL AND sent_at >= datetime('now', '-25 days') LIMIT 1`,
      )
      .get(doctorId, alertType);
  }
  return !!db
    .prepare(
      `SELECT id FROM alert_log WHERE doctor_id = ? AND alert_type = ? AND subject_id = ? AND sent_at >= datetime('now', '-25 days') LIMIT 1`,
    )
    .get(doctorId, alertType, subjectId);
};

const log = ({
  doctor_id,
  alert_type,
  subject_id,
  recipient_email,
  success,
  error_message,
}) =>
  db
    .prepare(
      `INSERT INTO alert_log (doctor_id, alert_type, subject_id, recipient_email, success, error_message) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      doctor_id,
      alert_type,
      subject_id || null,
      recipient_email || null,
      success ? 1 : 0,
      error_message || null,
    );

const findAll = ({ doctorId, limit = 100 } = {}) => {
  if (doctorId) {
    return db
      .prepare(
        `
      SELECT al.*, d.first_name, d.last_name
      FROM alert_log al JOIN doctors d ON al.doctor_id = d.id
      WHERE al.doctor_id = ? ORDER BY al.sent_at DESC LIMIT ?
    `,
      )
      .all(doctorId, limit);
  }
  return db
    .prepare(
      `
    SELECT al.*, d.first_name, d.last_name
    FROM alert_log al JOIN doctors d ON al.doctor_id = d.id
    ORDER BY al.sent_at DESC LIMIT ?
  `,
    )
    .all(limit);
};

module.exports = { wasAlertSent, log, findAll };
