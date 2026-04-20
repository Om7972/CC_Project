const multer = require('multer');

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/zip',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) return cb(new Error('Unsupported file type'));
    cb(null, true);
  },
});

module.exports = { upload, allowedTypes };
