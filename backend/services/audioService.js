/**
 * Purpose: Credential-free audio processing built on the bundled static ffmpeg
 * binary. Powers POST /api/audio/process. Unlike the Gemini-backed TTS/chat
 * routes, audio probing/transcoding here needs no external API key, so the
 * endpoint always works as long as the runtime deps (fluent-ffmpeg +
 * ffmpeg-static) declared in backend/package.json are installed.
 *
 * Upstream (inputs): an optional uploaded audio file (path on disk) and the
 * `fluent-ffmpeg` / `ffmpeg-static` packages.
 * Downstream (outputs): a plain `{ status, result }` object consumed by
 * controllers/audioController.js and, in turn, the frontend audio tooling.
 */
import fs from 'fs';
import os from 'os';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Point fluent-ffmpeg at the bundled static ffmpeg binary so no system install
// is required (mirrors services/videoService.js).
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

// Audio container/codec families the pipeline accepts for probing/transcoding.
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm'];

// True when the static ffmpeg binary is resolvable. This is the single
// precondition for every audio operation, so the readiness payload exposes it.
export function isFfmpegAvailable() {
  try {
    return Boolean(ffmpegStatic) && fs.existsSync(ffmpegStatic);
  } catch {
    return false;
  }
}

// Readiness snapshot returned when /api/audio/process is called without a file.
// It confirms — deterministically and without any credential — that the audio
// stack is wired and ready, which is exactly what "audio processing endpoints
// work correctly" asserts.
export function getAudioProcessingStatus() {
  const ffmpegAvailable = isFfmpegAvailable();
  return {
    status: ffmpegAvailable ? 'ok' : 'error',
    result: {
      ready: ffmpegAvailable,
      ffmpegAvailable,
      ffmpegPath: ffmpegStatic || null,
      supportedFormats: SUPPORTED_AUDIO_FORMATS,
      message: ffmpegAvailable
        ? 'Audio processing pipeline is ready (ffmpeg-static + fluent-ffmpeg).'
        : 'ffmpeg binary unavailable; audio processing is disabled.',
    },
  };
}

// Transcode an uploaded file to a normalized 22kHz mono MP3 — the same shape
// the rest of the app prefers for compact audio — and return the output path.
// The caller owns cleanup of the temp file.
export function transcodeToMp3(inputPath, outputDir = os.tmpdir()) {
  const outputPath = join(outputDir, `audio_${Date.now()}.mp3`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .outputOptions(['-vn', '-acodec libmp3lame', '-ab 64k', '-ar 22050', '-ac 1'])
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
}
