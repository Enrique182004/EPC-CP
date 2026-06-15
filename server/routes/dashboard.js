const express = require("express");
const db = require("../config/database");
const Document = require("../models/Document");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard
router.get("/", authenticate, (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const wf = isAdmin ? "" : "AND d.assigned_worker_id = @wid";
    const wfD = isAdmin ? "" : "AND assigned_worker_id = @wid";
    const wfWhere = isAdmin ? "" : "WHERE d.assigned_worker_id = @wid";
    const wfWhereD = isAdmin ? "" : "WHERE assigned_worker_id = @wid";
    const wp = isAdmin ? {} : { wid: req.user.id };

    // Upcoming expirations (next 90 days)
    const expiringLicenses = db
      .prepare(
        `
      SELECT d.id, d.first_name, d.last_name, pi.id_type, pi.expiration_date,
             CAST(julianday(pi.expiration_date) - julianday('now') AS INTEGER) as days_until
      FROM professional_ids pi
      JOIN doctors d ON pi.doctor_id = d.id
      WHERE pi.expiration_date IS NOT NULL
        AND date(pi.expiration_date) >= date('now')
        AND date(pi.expiration_date) <= date('now', '+90 days')
        AND pi.id_type IN ('state_license','DEA')
        ${wf}
      ORDER BY pi.expiration_date
      LIMIT 20
    `,
      )
      .all(wp);

    const expiringInsurance = db
      .prepare(
        `
      SELECT d.id, d.first_name, d.last_name, li.carrier_name, li.expiration_date,
             CAST(julianday(li.expiration_date) - julianday('now') AS INTEGER) as days_until
      FROM liability_insurance li
      JOIN doctors d ON li.doctor_id = d.id
      WHERE li.is_current = 1 AND li.expiration_date IS NOT NULL
        AND date(li.expiration_date) >= date('now')
        AND date(li.expiration_date) <= date('now', '+90 days')
        ${wf}
      ORDER BY li.expiration_date
      LIMIT 20
    `,
      )
      .all(wp);

    const expiringRecredentialing = db
      .prepare(
        `
      SELECT id, first_name, last_name, recredentialing_due_date,
             CAST(julianday(recredentialing_due_date) - julianday('now') AS INTEGER) as days_until
      FROM doctors
      WHERE recredentialing_due_date IS NOT NULL
        AND date(recredentialing_due_date) >= date('now')
        AND date(recredentialing_due_date) <= date('now', '+180 days')
        ${wfD}
      ORDER BY recredentialing_due_date
      LIMIT 20
    `,
      )
      .all(wp);

    // Doctor status summary
    const statusCounts = db
      .prepare(
        `
      SELECT credentialing_status, COUNT(*) as count FROM doctors
      ${wfWhereD}
      GROUP BY credentialing_status
    `,
      )
      .all(wp);

    // All doctors with status info for grid
    const doctorGrid = db
      .prepare(
        `
      SELECT d.id, d.first_name, d.last_name, d.credentialing_status,
             d.recredentialing_due_date, d.tdi_completed,
             u.name as worker_name,
             (SELECT COUNT(*) FROM documents doc WHERE doc.doctor_id = d.id AND doc.status = 'missing' AND doc.required = 1) as missing_docs_count,
             (SELECT MIN(li.expiration_date) FROM liability_insurance li WHERE li.doctor_id = d.id AND li.is_current = 1) as insurance_expiry,
             (SELECT MIN(pi.expiration_date) FROM professional_ids pi WHERE pi.doctor_id = d.id AND pi.id_type = 'state_license') as license_expiry
      FROM doctors d
      LEFT JOIN users u ON d.assigned_worker_id = u.id
      ${wfWhere}
      ORDER BY d.last_name, d.first_name
    `,
      )
      .all(wp);

    // Missing forms summary (doctors with at least 1 missing required doc)
    const missingForms = db
      .prepare(
        `
      SELECT d.id, d.first_name, d.last_name,
             COUNT(*) as missing_count
      FROM documents doc
      JOIN doctors d ON doc.doctor_id = d.id
      WHERE doc.status = 'missing' AND doc.required = 1
        ${wf}
      GROUP BY d.id
      ORDER BY missing_count DESC
      LIMIT 20
    `,
      )
      .all(wp);

    // Pending TDI
    const pendingTdi = db
      .prepare(
        `
      SELECT t.*, d.first_name, d.last_name
      FROM tdi_applications t
      JOIN doctors d ON t.doctor_id = d.id
      WHERE t.status != 'signed' AND t.status != 'filed'
        ${wf}
      ORDER BY d.last_name
      LIMIT 20
    `,
      )
      .all(wp);

    // Stalled workflows (in_progress, no update in 30+ days)
    const stalledWorkflows = db
      .prepare(
        `
      SELECT d.id, d.first_name, d.last_name, wi.current_step, wi.status, wi.updated_at
      FROM workflow_instances wi
      JOIN doctors d ON wi.doctor_id = d.id
      WHERE wi.status = 'in_progress'
        AND datetime(wi.updated_at) <= datetime('now', '-30 days')
        ${wf}
      ORDER BY wi.updated_at
      LIMIT 20
    `,
      )
      .all(wp);

    const totalDoctors = db
      .prepare(`SELECT COUNT(*) as n FROM doctors ${wfWhereD}`)
      .get(wp).n;

    res.json({
      expiringLicenses,
      expiringInsurance,
      expiringRecredentialing,
      statusCounts,
      doctorGrid,
      missingForms,
      pendingTdi,
      stalledWorkflows,
      totals: {
        doctors: totalDoctors,
        pending:
          statusCounts.find((s) => s.credentialing_status === "pending")
            ?.count || 0,
        inProgress:
          statusCounts.find((s) => s.credentialing_status === "in_progress")
            ?.count || 0,
        complete:
          statusCounts.find((s) => s.credentialing_status === "complete")
            ?.count || 0,
        expired:
          statusCounts.find((s) => s.credentialing_status === "expired")
            ?.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
