const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Doctor = require('../models/Doctor');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads', req.params.id, req.params.type);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// GET /api/doctors/:id/documents
router.get('/', authenticate, (req, res, next) => {
  try {
    const docs = Document.findByDoctor(parseInt(req.params.id));
    res.json(docs);
  } catch (err) { next(err); }
});

// POST /api/doctors/:id/documents/:type/upload
router.post('/:type/upload', authenticate, upload.single('file'), (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const docType = req.params.type;

    if (!Document.DOC_TYPES.includes(docType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const doctor = Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const doc = Document.findByType(doctorId, docType);
    const relativePath = path.join('uploads', req.params.id, docType, req.file.filename);

    Document.addVersion(doc.id, {
      file_name: req.file.originalname,
      file_path: relativePath,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.id,
    });

    res.json({ message: 'Document uploaded', doc_type: docType });
  } catch (err) { next(err); }
});

// GET /api/doctors/:id/documents/:type/versions
router.get('/:type/versions', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doc = Document.findByType(doctorId, req.params.type);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(Document.getVersions(doc.id));
  } catch (err) { next(err); }
});

// GET /api/doctors/:id/documents/:type/download/:versionId
router.get('/:type/download/:versionId', authenticate, (req, res, next) => {
  try {
    const version = Document.getVersionById(parseInt(req.params.versionId));
    if (!version) return res.status(404).json({ error: 'Version not found' });
    const filePath = path.join(__dirname, '..', version.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });
    res.download(filePath, version.file_name);
  } catch (err) { next(err); }
});

// PATCH /api/doctors/:id/documents/:type
router.patch('/:type', authenticate, (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doc = Document.findByType(doctorId, req.params.type);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    Document.updateStatus(doc.id, req.body.status || doc.status, req.body.notes);
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
});

module.exports = router;
