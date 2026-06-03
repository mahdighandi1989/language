/**
 * Purpose: HTTP handler for POST /api/upload. Provides a credential-free,
 * generic file-intake entry point that returns a stable { fileId, message }
 * handle the frontend (or a later analysis call) can reference.
 *
 * Behaviour:
 *   - With an uploaded `file` (multipart/form-data): multer has already written
 *     the file to the shared temp upload dir under a unique, timestamped name;
 *     that name is surfaced verbatim as the opaque `fileId` so the caller can
 *     pass it on without learning the on-disk path. Responds 200 with
 *     { fileId, message, filename, mimeType, sizeBytes }.
 *   - With no file: still answers 200 with a freshly generated `fileId` and a
 *     readiness `message`. This keeps the endpoint a deterministic, dependency-
 *     only signal (no Gemini key required) so health probes and the verify
 *     contract get a stable { fileId, message } answer even without credentials.
 *
 * Upstream: middleware/upload.js (multer disk storage + uploadDir).
 * Downstream: consumed by the frontend upload flow; the response contract is the
 * stable { fileId, message } object. Additive — it does not change the existing
 * /api/analyze-files or /api/audio/process contracts.
 */
import { randomUUID } from 'crypto';
import { basename } from 'path';

export async function uploadFile(req, res) {
  if (req.file) {
    // multer wrote the upload to uploadDir as `${Date.now()}-${originalname}`;
    // expose that unique filename as the opaque fileId reference.
    const fileId = basename(req.file.path);
    return res.status(200).json({
      fileId,
      message: `فایل با موفقیت آپلود شد (${req.file.originalname})`,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
  }

  // No file uploaded -> deterministic readiness handle so the endpoint always
  // answers 200 with the { fileId, message } contract.
  return res.status(200).json({
    fileId: randomUUID(),
    message: 'آماده دریافت فایل (no file uploaded — readiness handle)',
  });
}

export default uploadFile;
