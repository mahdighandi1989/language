import multer from 'multer';
import fs from 'fs';
import os from 'os';
import { join } from 'path';

// Directory where uploaded files are temporarily stored on disk. Disk storage
// (rather than memory) lets the analysis endpoint stream very large media files
// to the Gemini File API without loading them entirely into memory.
export const uploadDir = join(os.tmpdir(), 'lebanese-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Restrict uploads to the file types the analysis endpoint actually handles,
// so arbitrary/unsupported files are rejected before being written to disk.
const ALLOWED_MIME_PREFIXES = ['audio/', 'video/', 'image/', 'text/'];
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'application/json']);

export function isAllowedMimeType(mimeType) {
  if (!mimeType) return false;
  if (ALLOWED_MIME_TYPES.has(mimeType)) return true;
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max per file
export const MAX_FILES = 10;

export const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (isAllowedMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
      err.message = `نوع فایل پشتیبانی نمی‌شود: ${file.mimetype}`;
      cb(err);
    }
  },
});

// Translate multer-specific upload errors into clear 400 JSON responses.
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم فایل بیش از حد مجاز است (حداکثر 500MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: `تعداد فایل‌ها بیش از حد مجاز است (حداکثر ${MAX_FILES})` });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: err.message || 'نوع فایل پشتیبانی نمی‌شود' });
    }
    return res.status(400).json({ error: `خطای آپلود: ${err.message}` });
  }
  next(err);
};
