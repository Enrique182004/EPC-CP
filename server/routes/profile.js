const express = require("express");
const db = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

function requireDoctorAccess(req, res, next) {
  if (req.user.role === "admin") return next();
  const doc = db
    .prepare("SELECT assigned_worker_id FROM doctors WHERE id = ?")
    .get(parseInt(req.params.id));
  if (!doc) return res.status(404).json({ error: "Doctor not found" });
  if (doc.assigned_worker_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  next();
}

// Generic CRUD factory for sub-resources
function makeSubResource(table, allowedFields, doctorForeignKey = "doctor_id") {
  const r = express.Router({ mergeParams: true });

  r.get("/", authenticate, requireDoctorAccess, (req, res, next) => {
    try {
      const rows = db
        .prepare(
          `SELECT * FROM ${table} WHERE ${doctorForeignKey} = ? ORDER BY id`,
        )
        .all(parseInt(req.params.id));
      res.json(rows);
    } catch (err) {
      next(err);
    }
  });

  r.post("/", authenticate, requireDoctorAccess, (req, res, next) => {
    try {
      const doctorId = parseInt(req.params.id);
      const fields = { [doctorForeignKey]: doctorId };
      for (const f of allowedFields) {
        if (req.body[f] !== undefined) fields[f] = req.body[f];
      }
      const cols = Object.keys(fields);
      const vals = Object.values(fields);
      const result = db
        .prepare(
          `INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
        )
        .run(...vals);
      const row = db
        .prepare(`SELECT * FROM ${table} WHERE id = ?`)
        .get(result.lastInsertRowid);
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  });

  r.patch("/:subId", authenticate, requireDoctorAccess, (req, res, next) => {
    try {
      const subId = parseInt(req.params.subId);
      const sets = [];
      const vals = [];
      for (const f of allowedFields) {
        if (req.body[f] !== undefined) {
          sets.push(`${f} = ?`);
          vals.push(req.body[f]);
        }
      }
      if (!sets.length)
        return res.status(400).json({ error: "No fields to update" });
      sets.push("updated_at = CURRENT_TIMESTAMP");
      const doctorId = parseInt(req.params.id);
      db.prepare(
        `UPDATE ${table} SET ${sets.join(", ")} WHERE id = ? AND ${doctorForeignKey} = ?`,
      ).run(...vals, subId, doctorId);
      const updated = db
        .prepare(
          `SELECT * FROM ${table} WHERE id = ? AND ${doctorForeignKey} = ?`,
        )
        .get(subId, doctorId);
      if (!updated) return res.status(404).json({ error: "Record not found" });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  r.delete("/:subId", authenticate, requireDoctorAccess, (req, res, next) => {
    try {
      const info = db
        .prepare(
          `DELETE FROM ${table} WHERE id = ? AND ${doctorForeignKey} = ?`,
        )
        .run(parseInt(req.params.subId), parseInt(req.params.id));
      if (info.changes === 0)
        return res.status(404).json({ error: "Record not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  return r;
}

// Sub-resource definitions
const professionalIds = makeSubResource("professional_ids", [
  "id_type",
  "id_number",
  "state",
  "issue_date",
  "expiration_date",
  "status",
]);
const education = makeSubResource("education", [
  "education_type",
  "institution_name",
  "city",
  "state",
  "country",
  "degree",
  "specialty",
  "start_date",
  "end_date",
]);
const specialties = makeSubResource("specialties", [
  "specialty_name",
  "board_certified",
  "certifying_board",
  "initial_cert_date",
  "recert_date",
  "expiration_date",
]);
const practiceLocations = makeSubResource("practice_locations", [
  "location_name",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "fax",
  "is_primary",
  "group_npi",
  "tax_id",
]);
const hospitalAffiliations = makeSubResource("hospital_affiliations", [
  "hospital_name",
  "address",
  "city",
  "state",
  "zip",
  "affiliation_type",
  "department",
  "start_date",
  "end_date",
  "privileges_requested",
]);
const credentialingContacts = makeSubResource("credentialing_contacts", [
  "contact_name",
  "title",
  "organization",
  "phone",
  "fax",
  "email",
  "contact_type",
]);
const liabilityInsurance = makeSubResource("liability_insurance", [
  "carrier_name",
  "policy_number",
  "coverage_type",
  "per_occurrence_limit",
  "aggregate_limit",
  "effective_date",
  "expiration_date",
  "tail_coverage",
  "tail_effective_date",
  "tail_expiration_date",
  "is_current",
]);
const employmentHistory = makeSubResource("employment_history", [
  "employer_name",
  "position_title",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "start_date",
  "end_date",
  "reason_for_leaving",
  "is_current",
]);
const professionalReferences = makeSubResource("professional_references", [
  "ref_name",
  "specialty",
  "relationship",
  "phone",
  "email",
  "years_known",
]);

// Disclosures - upsert all at once
const DISCLOSURE_QUESTIONS = [
  "malpractice_claims",
  "license_revoked",
  "license_suspended",
  "dea_revoked",
  "felony_conviction",
  "hospital_privileges_revoked",
  "board_action",
  "bankruptcy",
  "substance_abuse",
  "mental_health_condition",
  "physical_condition",
  "medicare_sanction",
];

const disclosures = express.Router({ mergeParams: true });
disclosures.get("/", authenticate, requireDoctorAccess, (req, res, next) => {
  try {
    const rows = db
      .prepare("SELECT * FROM disclosures WHERE doctor_id = ?")
      .all(parseInt(req.params.id));
    // Return all questions with defaults
    const map = {};
    for (const r of rows) map[r.question_key] = r;
    const result = DISCLOSURE_QUESTIONS.map(
      (q) => map[q] || { question_key: q, answer: 0, explanation: "" },
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

disclosures.put("/", authenticate, requireDoctorAccess, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const disclosureData = req.body;
    if (!Array.isArray(disclosureData))
      return res.status(400).json({ error: "Body must be an array" });
    const validKeys = new Set(DISCLOSURE_QUESTIONS);
    const upsert = db.prepare(`
      INSERT INTO disclosures (doctor_id, question_key, answer, explanation) VALUES (?, ?, ?, ?)
      ON CONFLICT(doctor_id, question_key) DO UPDATE SET answer = excluded.answer, explanation = excluded.explanation, updated_at = CURRENT_TIMESTAMP
    `);
    const tx = db.transaction(() => {
      for (const d of disclosureData) {
        if (!validKeys.has(d.question_key)) continue;
        const explanation =
          typeof d.explanation === "string"
            ? d.explanation.slice(0, 2000) || null
            : null;
        upsert.run(doctorId, d.question_key, d.answer ? 1 : 0, explanation);
      }
    });
    tx();
    res.json({ message: "Disclosures saved" });
  } catch (err) {
    next(err);
  }
});

module.exports = {
  professionalIds,
  education,
  specialties,
  practiceLocations,
  hospitalAffiliations,
  credentialingContacts,
  liabilityInsurance,
  employmentHistory,
  professionalReferences,
  disclosures,
};
