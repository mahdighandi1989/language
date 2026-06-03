import { test } from 'node:test';
import assert from 'node:assert/strict';
import multer from 'multer';
import {
  isAllowedMimeType,
  MAX_FILE_SIZE,
  MAX_FILES,
  handleMulterError,
} from '../middleware/upload.js';

// The File Analysis API (/api/analyze-files) accepts arbitrary user uploads, so
// the multer pipeline is the security boundary: it must reject unsupported file
// types up front and cap per-file size / file count. These tests pin that
// validation contract so a future refactor cannot silently widen it.

// --- type allow-list ------------------------------------------------------

// AC: the analysis endpoint only handles audio/video/image/text plus pdf+json,
// so isAllowedMimeType accepts exactly those and nothing else.
test('test_allowed_mime_prefixes_pass', () => {
  for (const mime of [
    'audio/mpeg',
    'video/mp4',
    'image/png',
    'image/jpeg',
    'text/plain',
  ]) {
    assert.equal(isAllowedMimeType(mime), true, `${mime} should be allowed`);
  }
});

test('test_allowed_exact_mime_types_pass', () => {
  assert.equal(isAllowedMimeType('application/pdf'), true);
  assert.equal(isAllowedMimeType('application/json'), true);
});

// AC: executables / archives / unknown types are rejected before disk write.
test('test_disallowed_mime_types_rejected', () => {
  for (const mime of [
    'application/x-msdownload',
    'application/octet-stream',
    'application/zip',
    'application/x-sh',
    'font/woff2',
  ]) {
    assert.equal(isAllowedMimeType(mime), false, `${mime} should be rejected`);
  }
});

// AC: a missing/empty mime type is treated as disallowed (fail closed).
test('test_missing_mime_type_rejected', () => {
  assert.equal(isAllowedMimeType(''), false);
  assert.equal(isAllowedMimeType(undefined), false);
  assert.equal(isAllowedMimeType(null), false);
});

// --- limits ---------------------------------------------------------------

// AC: per-file size cap is 500MB and at most 10 files per request.
test('test_upload_limits', () => {
  assert.equal(MAX_FILE_SIZE, 500 * 1024 * 1024, 'per-file cap should be 500MB');
  assert.equal(MAX_FILES, 10, 'at most 10 files per request');
});

// --- error translation ----------------------------------------------------

// Minimal Express res double capturing the status + JSON body.
function makeRes() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// AC: an oversized upload surfaces as a 400 with a clear Persian message.
test('test_multer_size_error_becomes_400', () => {
  const res = makeRes();
  const err = new multer.MulterError('LIMIT_FILE_SIZE');
  handleMulterError(err, {}, res, () => assert.fail('next should not be called'));
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /حجم فایل/);
});

// AC: too many files -> 400 mentioning the MAX_FILES cap.
test('test_multer_count_error_becomes_400', () => {
  const res = makeRes();
  const err = new multer.MulterError('LIMIT_FILE_COUNT');
  handleMulterError(err, {}, res, () => assert.fail('next should not be called'));
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, new RegExp(String(MAX_FILES)));
});

// AC: a rejected (unsupported) file type -> 400 carrying the filter message.
test('test_multer_unexpected_file_becomes_400', () => {
  const res = makeRes();
  const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'files');
  err.message = 'نوع فایل پشتیبانی نمی‌شود: application/zip';
  handleMulterError(err, {}, res, () => assert.fail('next should not be called'));
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /نوع فایل پشتیبانی نمی‌شود/);
});

// AC: non-multer errors are passed through to the next error handler untouched.
test('test_non_multer_error_passes_through', () => {
  const res = makeRes();
  const original = new Error('something else');
  let forwarded;
  handleMulterError(original, {}, res, (e) => {
    forwarded = e;
  });
  assert.equal(res.statusCode, undefined, 'should not write a response');
  assert.equal(forwarded, original, 'the original error should reach next()');
});
