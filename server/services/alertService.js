const Doctor = require("../models/Doctor");
const AlertLog = require("../models/AlertLog");
const { sendMail } = require("../config/mailer");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const THRESHOLDS = [
  { days: 180, label: "6_months" },
  { days: 90, label: "3_months" },
  { days: 30, label: "1_month" },
];

function emailHtml(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e3a5f;padding:20px;text-align:center">
        <h1 style="color:white;margin:0">EPC Credentialing</h1>
      </div>
      <div style="padding:24px;background:#f9f9f9">
        <h2>${title}</h2>
        ${body}
        <p style="margin-top:24px">
          <a href="${CLIENT_URL}" style="background:#1e3a5f;color:white;padding:10px 20px;text-decoration:none;border-radius:4px">
            Open Credentialing Portal
          </a>
        </p>
      </div>
      <div style="padding:12px;text-align:center;color:#999;font-size:12px">
        EPC Medical Credentialing System
      </div>
    </div>
  `;
}

async function sendAlert({
  to,
  subject,
  htmlBody,
  doctor_id,
  alert_type,
  subject_id,
}) {
  try {
    await sendMail({ to, subject, html: htmlBody });
    AlertLog.log({
      doctor_id,
      alert_type,
      subject_id,
      recipient_email: to,
      success: true,
    });
  } catch (err) {
    AlertLog.log({
      doctor_id,
      alert_type,
      subject_id,
      recipient_email: to,
      success: false,
      error_message: err.message,
    });
  }
}

async function checkExpirations() {
  console.log("[AlertService] Running expiration check...");

  for (const { days, label } of THRESHOLDS) {
    // --- Malpractice Insurance ---
    const insurances = Doctor.findExpiringInsurance(days);
    for (const row of insurances) {
      const alertType = `malpractice_${label}`;
      if (!AlertLog.wasAlertSent(row.id, alertType, row.ins_id)) {
        const subject = `ALERT: Malpractice Insurance Expiring - Dr. ${row.last_name}`;
        const body = `<p>Dr. <strong>${row.first_name} ${row.last_name}</strong>'s malpractice insurance with <strong>${row.carrier_name}</strong> expires on <strong>${row.expiration_date}</strong>.</p><p>Please renew before expiration to maintain credentialing status.</p>`;
        const html = emailHtml(
          `Malpractice Insurance Expiration Warning (${label.replace("_", " ")})`,
          body,
        );

        const recipients = [
          row.personal_email,
          row.work_email,
          row.worker_email,
        ].filter(Boolean);
        for (const email of [...new Set(recipients)]) {
          await sendAlert({
            to: email,
            subject,
            htmlBody: html,
            doctor_id: row.id,
            alert_type: alertType,
            subject_id: row.ins_id,
          });
        }
      }
    }

    // --- State License / DEA ---
    const licenses = Doctor.findExpiringLicenses(days);
    for (const row of licenses) {
      const alertType = `license_${label}_${row.pid_id}`;
      if (!AlertLog.wasAlertSent(row.id, alertType, row.pid_id)) {
        const subject = `ALERT: ${row.id_type} Expiring - Dr. ${row.last_name}`;
        const body = `<p>Dr. <strong>${row.first_name} ${row.last_name}</strong>'s <strong>${row.id_type}</strong> expires on <strong>${row.expiration_date}</strong>.</p><p>Please renew promptly.</p>`;
        const html = emailHtml(
          `${row.id_type} Expiration Warning (${label.replace("_", " ")})`,
          body,
        );

        const recipients = [
          row.personal_email,
          row.work_email,
          row.worker_email,
        ].filter(Boolean);
        for (const email of [...new Set(recipients)]) {
          await sendAlert({
            to: email,
            subject,
            htmlBody: html,
            doctor_id: row.id,
            alert_type: alertType,
            subject_id: row.pid_id,
          });
        }
      }
    }

    // --- Re-credentialing ---
    const recreds = Doctor.findExpiringRecredentialing(days);
    for (const row of recreds) {
      const alertType = `recredentialing_${label}`;
      if (!AlertLog.wasAlertSent(row.id, alertType, null)) {
        const subject = `REMINDER: Re-credentialing Due - Dr. ${row.last_name}`;
        const body = `<p>Dr. <strong>${row.first_name} ${row.last_name}</strong>'s re-credentialing is due on <strong>${row.recredentialing_due_date}</strong>.</p><p>Please initiate the re-credentialing process soon.</p>`;
        const html = emailHtml(
          `Re-credentialing Reminder (${label.replace("_", " ")})`,
          body,
        );

        const recipients = [
          row.personal_email,
          row.work_email,
          row.worker_email,
        ].filter(Boolean);
        for (const email of [...new Set(recipients)]) {
          await sendAlert({
            to: email,
            subject,
            htmlBody: html,
            doctor_id: row.id,
            alert_type: alertType,
            subject_id: null,
          });
        }
      }
    }
  }
  console.log("[AlertService] Expiration check complete.");
}

async function sendMissingFormsReminder(doctor, missingForms, workerEmail) {
  const doctorEmail = doctor.personal_email || doctor.work_email;
  const formList = missingForms.map((f) => `<li>${f}</li>`).join("");
  const body = `<p>The following documents are still missing for Dr. <strong>${doctor.first_name} ${doctor.last_name}</strong>:</p><ul>${formList}</ul><p>Please provide these documents as soon as possible.</p>`;
  const html = emailHtml("Missing Credentialing Documents", body);
  const subject = `Action Required: Missing Documents - Dr. ${doctor.last_name}`;

  if (doctorEmail) await sendMail({ to: doctorEmail, subject, html });
  if (workerEmail) await sendMail({ to: workerEmail, subject, html });
}

module.exports = { checkExpirations, sendMissingFormsReminder };
