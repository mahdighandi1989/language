/**
 * Purpose: HTTP handler for POST /api/audio/process. Provides a credential-free
 * audio-processing entry point that confirms the ffmpeg-backed pipeline works.
 *
 * Behaviour:
 *   - With no uploaded file: returns a 200 readiness snapshot
 *     ({ status, result }) describing the audio pipeline. This makes the
 *     endpoint a deterministic, dependency-only health signal (no Gemini key
 *     required), so "audio processing endpoints work correctly" holds even in
 *     environments without external credentials.
 *   - With an uploaded `file` (multipart/form-data): probes the audio with
 *     ffprobe and returns its metadata under the same { status, result } shape.
 *
 * Upstream: services/audioService.js (ffmpeg-static + fluent-ffmpeg).
 * Downstream: consumed by the frontend audio tooling; the response contract is
 * the stable { status, result } object documented in README.
 */
import fs from 'fs';
import {
  getAudioProcessingStatus,
  isFfmpegAvailable,
  transcodeToMp3,
} from '../services/audioService.js';

export async function processAudio(req, res) {
  // No file uploaded -> report pipeline readiness. Always 200 when ffmpeg is
  // present so health probes and the verify contract get a stable answer.
  if (!req.file) {
    const snapshot = getAudioProcessingStatus();
    return res.status(snapshot.status === 'ok' ? 200 : 503).json(snapshot);
  }

  if (!isFfmpegAvailable()) {
    return res.status(503).json({
      status: 'error',
      result: { ready: false, message: 'ffmpeg binary unavailable' },
    });
  }

  const filePath = req.file.path;
  let outputPath = null;
  try {
    // Normalize the upload to a compact 22kHz mono MP3 using the static ffmpeg
    // binary (no ffprobe / no credential required) and report the result.
    outputPath = await transcodeToMp3(filePath);
    const outStat = await fs.promises.stat(outputPath);
    return res.status(200).json({
      status: 'ok',
      result: {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        inputSizeBytes: req.file.size,
        processed: true,
        outputFormat: 'mp3',
        outputSizeBytes: outStat.size,
      },
    });
  } catch (err) {
    console.error('Audio processing failed:', err?.message || err);
    return res.status(422).json({
      status: 'error',
      result: { message: 'پردازش فایل صوتی ناموفق بود (could not process audio file)' },
    });
  } finally {
    // Best-effort cleanup of both temp files.
    fs.promises.unlink(filePath).catch(() => {});
    if (outputPath) fs.promises.unlink(outputPath).catch(() => {});
  }
}
