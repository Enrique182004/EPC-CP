const db = require("../config/database");

const getSteps = () =>
  db.prepare("SELECT * FROM workflow_steps ORDER BY step_number").all();

const getInstance = (doctorId) =>
  db
    .prepare("SELECT * FROM workflow_instances WHERE doctor_id = ?")
    .get(doctorId);

const createInstance = (doctorId) => {
  const tx = db.transaction(() => {
    db.prepare(
      "INSERT OR IGNORE INTO workflow_instances (doctor_id) VALUES (?)",
    ).run(doctorId);
    const instance = db
      .prepare("SELECT * FROM workflow_instances WHERE doctor_id = ?")
      .get(doctorId);
    const steps = db.prepare("SELECT * FROM workflow_steps").all();
    const insertStep = db.prepare(
      "INSERT OR IGNORE INTO workflow_step_instances (workflow_id, step_id) VALUES (?, ?)",
    );
    for (const s of steps) insertStep.run(instance.id, s.id);
    return instance;
  });
  return tx();
};

const getStepInstances = (workflowId) =>
  db
    .prepare(
      `
    SELECT wsi.*, ws.step_number, ws.step_name, ws.description, ws.required_doc_types,
           u.name as completed_by_name
    FROM workflow_step_instances wsi
    JOIN workflow_steps ws ON wsi.step_id = ws.id
    LEFT JOIN users u ON wsi.completed_by = u.id
    WHERE wsi.workflow_id = ?
    ORDER BY ws.step_number
  `,
    )
    .all(workflowId);

const updateStep = (workflowId, stepId, { status, notes, completed_by }) => {
  const completedAt = status === "complete" ? new Date().toISOString() : null;
  db.prepare(
    `
    UPDATE workflow_step_instances
    SET status = ?, notes = ?, completed_by = ?, completed_at = ?
    WHERE workflow_id = ? AND step_id = ?
  `,
  ).run(
    status,
    notes || null,
    completed_by || null,
    completedAt,
    workflowId,
    stepId,
  );
};

const advance = (workflowId, nextStep) => {
  const valid = db
    .prepare("SELECT id FROM workflow_steps WHERE step_number = ?")
    .get(nextStep);
  if (!valid)
    throw Object.assign(new Error(`Invalid step number: ${nextStep}`), {
      status: 400,
    });
  db.prepare(
    `UPDATE workflow_instances SET current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(nextStep, workflowId);
};

const complete = (workflowId) => {
  db.prepare(
    `UPDATE workflow_instances SET status = 'complete', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(workflowId);
};

const updateStatus = (workflowId, status) => {
  db.prepare(
    `UPDATE workflow_instances SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(status, workflowId);
};

module.exports = {
  getSteps,
  getInstance,
  createInstance,
  getStepInstances,
  updateStep,
  advance,
  complete,
  updateStatus,
};
