const db = require("../config/database");

const findAll = () =>
  db
    .prepare(
      "SELECT id, email, role, name, phone, created_at FROM users ORDER BY name",
    )
    .all();
const findById = (id) =>
  db
    .prepare(
      "SELECT id, email, role, name, phone, created_at FROM users WHERE id = ?",
    )
    .get(id);

const findByIdWithToken = (id) =>
  db
    .prepare(
      "SELECT id, email, role, name, phone, google_refresh_token, created_at FROM users WHERE id = ?",
    )
    .get(id);
const findByEmail = (email) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email);

const create = ({ email, password_hash, role, name, phone }) =>
  db
    .prepare(
      "INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)",
    )
    .run(email, password_hash, role, name, phone || null);

const update = (id, fields) => {
  const allowed = ["name", "phone", "role"];
  const sets = allowed
    .filter((k) => fields[k] !== undefined)
    .map((k) => `${k} = ?`);
  const vals = allowed
    .filter((k) => fields[k] !== undefined)
    .map((k) => fields[k]);
  if (!sets.length) return;
  sets.push("updated_at = CURRENT_TIMESTAMP");
  db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(
    ...vals,
    id,
  );
};

const updateGoogleToken = (id, token) =>
  db
    .prepare(
      "UPDATE users SET google_refresh_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(token, id);

module.exports = {
  findAll,
  findById,
  findByIdWithToken,
  findByEmail,
  create,
  update,
  updateGoogleToken,
};
