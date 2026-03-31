const express = require('express');
const Workflow = require('../models/Workflow');
const Document = require('../models/Document');
const Doctor = require('../models/Doctor');
const { authenticate } = require('../middleware/auth');
const { sendMissingFormsReminder } = require('../services/alertService');

const router = express.Router({ mergeParams: true });

// GET /api/doctors/:id/workflow
router.get('/', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    let instance = Workflow.getInstance(doctorId);
    if (!instance) instance = Workflow.createInstance(doctorId);
    const steps = Workflow.getStepInstances(instance.id);
    res.json({ instance, steps });
  } catch (err) { next(err); }
});

// GET /api/doctors/:id/workflow/missing-forms
router.get('/missing-forms', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const docs = Document.findByDoctor(doctorId);
    const missing = docs.filter(d => d.required && d.status === 'missing');
    res.json(missing.map(d => ({ doc_type: d.doc_type, status: d.status })));
  } catch (err) { next(err); }
});

// POST /api/doctors/:id/workflow/advance
router.post('/advance', authenticate, async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const instance = Workflow.getInstance(doctorId);
    if (!instance) return res.status(404).json({ error: 'Workflow not found' });
    if (instance.status === 'complete') return res.status(400).json({ error: 'Workflow already complete' });

    const steps = Workflow.getSteps();
    const nextStep = instance.current_step + 1;

    if (nextStep > steps.length) {
      Workflow.complete(instance.id);
      // Set recredentialing due date (3 years from now)
      const threeYears = new Date();
      threeYears.setFullYear(threeYears.getFullYear() + 3);
      Doctor.update(doctorId, {
        credentialing_status: 'complete',
        recredentialing_due_date: threeYears.toISOString().split('T')[0],
      });
      return res.json({ message: 'Credentialing complete', status: 'complete' });
    }

    Workflow.advance(instance.id, nextStep);
    res.json({ message: 'Advanced to step ' + nextStep, current_step: nextStep });
  } catch (err) { next(err); }
});

// PATCH /api/doctors/:id/workflow/step/:stepId
router.patch('/step/:stepId', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const stepId = parseInt(req.params.stepId);
    const instance = Workflow.getInstance(doctorId);
    if (!instance) return res.status(404).json({ error: 'Workflow not found' });
    Workflow.updateStep(instance.id, stepId, {
      status: req.body.status,
      notes: req.body.notes,
      completed_by: req.user.id,
    });
    res.json({ message: 'Step updated' });
  } catch (err) { next(err); }
});

// POST /api/doctors/:id/workflow/send-reminder
router.post('/send-reminder', authenticate, async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctor = Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const docs = Document.findByDoctor(doctorId);
    const missing = docs.filter(d => d.required && d.status === 'missing').map(d => d.doc_type);

    if (!missing.length) return res.json({ message: 'No missing forms' });

    await sendMissingFormsReminder(doctor, missing, doctor.worker_email);
    res.json({ message: 'Reminder sent', missing });
  } catch (err) { next(err); }
});

module.exports = router;
