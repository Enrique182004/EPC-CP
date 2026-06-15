const db = require("../config/database");

const VALID_STATUSES = new Set([
  "pending",
  "in_progress",
  "complete",
  "expired",
  "on_hold",
]);

const findAll = ({ search, status, workerId } = {}) => {
  let q = `SELECT d.*, u.name as worker_name FROM doctors d LEFT JOIN users u ON d.assigned_worker_id = u.id WHERE 1=1`;
  const params = [];
  if (search) {
    q += ` AND (d.first_name LIKE ? OR d.last_name LIKE ? OR d.npi LIKE ? OR d.caqh_id LIKE ?)`;
    // Escape LIKE wildcards in the search string to treat them as literals
    const escaped = String(search).replace(/[%_\\]/g, "\\$&");
    const s = `%${escaped}%`;
    params.push(s, s, s, s);
  }
  if (status && VALID_STATUSES.has(status)) {
    q += ` AND d.credentialing_status = ?`;
    params.push(status);
  }
  if (workerId) {
    q += ` AND d.assigned_worker_id = ?`;
    params.push(workerId);
  }
  q += ` ORDER BY d.last_name, d.first_name`;
  return db.prepare(q).all(...params);
};

const findById = (id) =>
  db
    .prepare(
      `SELECT d.*, u.name as worker_name, u.email as worker_email FROM doctors d LEFT JOIN users u ON d.assigned_worker_id = u.id WHERE d.id = ?`,
    )
    .get(id);

const ALLOWED_CREATE_FIELDS = [
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
  "date_of_birth",
  "ssn_last4",
  "gender",
  "home_address",
  "home_city",
  "home_state",
  "home_zip",
  "home_phone",
  "cell_phone",
  "personal_email",
  "npi",
  "caqh_id",
  "work_email",
  "primary_specialty",
  "credentialing_status",
  "assigned_worker_id",
  "tdi_completed",
  "recredentialing_due_date",
  "notes",
];

const create = (fields) => {
  const cols = ALLOWED_CREATE_FIELDS.filter((k) => fields[k] !== undefined);
  const vals = cols.map((k) => fields[k]);
  return db
    .prepare(
      `INSERT INTO doctors (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    )
    .run(...vals);
};

const update = (id, fields) => {
  const allowed = [
    "first_name",
    "middle_name",
    "last_name",
    "suffix",
    "date_of_birth",
    "ssn_last4",
    "gender",
    "home_address",
    "home_city",
    "home_state",
    "home_zip",
    "home_phone",
    "cell_phone",
    "personal_email",
    "npi",
    "caqh_id",
    "work_email",
    "primary_specialty",
    "credentialing_status",
    "assigned_worker_id",
    "tdi_completed",
    "recredentialing_due_date",
    "notes",
  ];
  const sets = allowed
    .filter((k) => fields[k] !== undefined)
    .map((k) => `${k} = ?`);
  const vals = allowed
    .filter((k) => fields[k] !== undefined)
    .map((k) => fields[k]);
  if (!sets.length) return;
  sets.push("updated_at = CURRENT_TIMESTAMP");
  db.prepare(`UPDATE doctors SET ${sets.join(", ")} WHERE id = ?`).run(
    ...vals,
    id,
  );
};

const remove = (id) => db.prepare("DELETE FROM doctors WHERE id = ?").run(id);

const findExpiringLicenses = (days) =>
  db
    .prepare(
      `
    SELECT d.id, d.first_name, d.last_name, d.personal_email, d.work_email,
           u.email as worker_email, u.name as worker_name,
           pi.id as pid_id, pi.id_type, pi.expiration_date
    FROM doctors d
    LEFT JOIN users u ON d.assigned_worker_id = u.id
    JOIN professional_ids pi ON pi.doctor_id = d.id
    WHERE pi.expiration_date IS NOT NULL
      AND date(pi.expiration_date) <= date('now', '+' || ? || ' days')
      AND date(pi.expiration_date) >= date('now')
      AND pi.id_type IN ('state_license','DEA')
    ORDER BY pi.expiration_date
  `,
    )
    .all(days);

const findExpiringInsurance = (days) =>
  db
    .prepare(
      `
    SELECT d.id, d.first_name, d.last_name, d.personal_email, d.work_email,
           u.email as worker_email, u.name as worker_name,
           li.id as ins_id, li.carrier_name, li.expiration_date
    FROM doctors d
    LEFT JOIN users u ON d.assigned_worker_id = u.id
    JOIN liability_insurance li ON li.doctor_id = d.id AND li.is_current = 1
    WHERE li.expiration_date IS NOT NULL
      AND date(li.expiration_date) <= date('now', '+' || ? || ' days')
      AND date(li.expiration_date) >= date('now')
    ORDER BY li.expiration_date
  `,
    )
    .all(days);

const findExpiringRecredentialing = (days) =>
  db
    .prepare(
      `
    SELECT d.id, d.first_name, d.last_name, d.personal_email, d.work_email,
           u.email as worker_email, u.name as worker_name, d.recredentialing_due_date
    FROM doctors d
    LEFT JOIN users u ON d.assigned_worker_id = u.id
    WHERE d.recredentialing_due_date IS NOT NULL
      AND date(d.recredentialing_due_date) <= date('now', '+' || ? || ' days')
      AND date(d.recredentialing_due_date) >= date('now')
    ORDER BY d.recredentialing_due_date
  `,
    )
    .all(days);

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findExpiringLicenses,
  findExpiringInsurance,
  findExpiringRecredentialing,
};
