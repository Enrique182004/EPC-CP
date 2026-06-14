const db = require("../config/database");

const findByDoctor = (doctorId) =>
  db
    .prepare("SELECT * FROM tdi_applications WHERE doctor_id = ?")
    .get(doctorId);

const upsert = (doctorId) =>
  db
    .prepare("INSERT OR IGNORE INTO tdi_applications (doctor_id) VALUES (?)")
    .run(doctorId);

const updateStatus = (doctorId, { status, notes }) => {
  const now = new Date().toISOString();
  const sets = ["status = ?", "notes = ?", "updated_at = CURRENT_TIMESTAMP"];
  const vals = [status, notes || null];

  if (status === "sent_to_doctor") {
    sets.push("sent_at = ?");
    vals.push(now);
  }
  if (status === "signed") {
    sets.push("signed_at = ?");
    vals.push(now);
  }
  if (status === "filed") {
    sets.push("filed_at = ?");
    vals.push(now);
  }

  db.prepare(
    `UPDATE tdi_applications SET ${sets.join(", ")} WHERE doctor_id = ?`,
  ).run(...vals, doctorId);
};

module.exports = { findByDoctor, upsert, updateStatus };
