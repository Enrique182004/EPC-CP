const db = require("../config/database");
const path = require("path");
const fs = require("fs");

const DOC_TYPES = [
  "liability_insurance",
  "standard_auth_release",
  "dea",
  "state_authorization",
  "state_license",
  "state_release",
];

function ensureDocumentRows(doctorId) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO documents (doctor_id, doc_type) VALUES (?, ?)`,
  );
  const tx = db.transaction(() => {
    for (const t of DOC_TYPES) insert.run(doctorId, t);
  });
  tx();
}

const findByDoctor = (doctorId) => {
  ensureDocumentRows(doctorId);
  return db
    .prepare(
      `
    SELECT d.*, dv.id as current_version_id, dv.file_name, dv.uploaded_at
    FROM documents d
    LEFT JOIN document_versions dv ON dv.document_id = d.id AND dv.is_current = 1
    WHERE d.doctor_id = ?
    ORDER BY d.doc_type
  `,
    )
    .all(doctorId);
};

const findByType = (doctorId, docType) => {
  ensureDocumentRows(doctorId);
  return db
    .prepare(`SELECT * FROM documents WHERE doctor_id = ? AND doc_type = ?`)
    .get(doctorId, docType);
};

const updateStatus = (id, status, notes) => {
  db.prepare(
    `UPDATE documents SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(status, notes || null, id);
};

const getVersions = (documentId) =>
  db
    .prepare(
      `
    SELECT dv.id, dv.document_id, dv.version_number, dv.file_name,
           dv.file_size, dv.mime_type, dv.uploaded_by, dv.uploaded_at,
           dv.is_current, u.name as uploader_name
    FROM document_versions dv
    LEFT JOIN users u ON dv.uploaded_by = u.id
    WHERE dv.document_id = ?
    ORDER BY dv.version_number DESC
  `,
    )
    .all(documentId);

const addVersion = (
  documentId,
  { file_name, file_path, file_size, mime_type, uploaded_by },
) => {
  const tx = db.transaction(() => {
    // Mark all existing versions as not current
    db.prepare(
      `UPDATE document_versions SET is_current = 0 WHERE document_id = ?`,
    ).run(documentId);

    // Get next version number
    const max = db
      .prepare(
        `SELECT MAX(version_number) as m FROM document_versions WHERE document_id = ?`,
      )
      .get(documentId);
    const nextVersion = (max.m || 0) + 1;

    // Insert new version
    db.prepare(
      `INSERT INTO document_versions (document_id, version_number, file_name, file_path, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      documentId,
      nextVersion,
      file_name,
      file_path,
      file_size || null,
      mime_type || null,
      uploaded_by || null,
    );

    // Delete oldest if more than 3
    const old = db
      .prepare(
        `SELECT id, file_path FROM document_versions WHERE document_id = ? ORDER BY version_number ASC`,
      )
      .all(documentId);
    if (old.length > 3) {
      const uploadsDir = path.resolve(__dirname, "../uploads");
      const toDelete = old.slice(0, old.length - 3);
      for (const v of toDelete) {
        db.prepare(`DELETE FROM document_versions WHERE id = ?`).run(v.id);
        try {
          const resolved = path.resolve(__dirname, "..", v.file_path);
          if (resolved.startsWith(uploadsDir + path.sep)) {
            fs.unlinkSync(resolved);
          }
        } catch (_) {}
      }
    }

    // Mark document as uploaded
    db.prepare(
      `UPDATE documents SET status = 'uploaded', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    ).run(documentId);
  });
  tx();
};

const getVersionById = (versionId) =>
  db.prepare(`SELECT * FROM document_versions WHERE id = ?`).get(versionId);

module.exports = {
  DOC_TYPES,
  ensureDocumentRows,
  findByDoctor,
  findByType,
  updateStatus,
  getVersions,
  addVersion,
  getVersionById,
};
