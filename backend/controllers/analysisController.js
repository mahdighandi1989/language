import { analyzeUploads } from '../services/analysisService.js';
import { cleanupTempFiles } from '../utils/fileCleanup.js';

// POST /api/analyze-files — analyze uploaded files and/or text with Gemini and
// return the merged analysis plus any small media items for embedding.
export async function analyzeFiles(req, res) {
  console.log('Received file analysis request');

  try {
    const result = await analyzeUploads({
      files: req.files || [],
      textContent: req.body.textContent || '',
      userInstructions: req.body.userInstructions || '',
    });
    res.json(result);
  } catch (error) {
    console.error('File analysis error:', error);
    // analyzeUploads cleans up temp files itself, but guard against errors
    // thrown before it takes ownership of the uploaded files.
    if (req.files) cleanupTempFiles(req.files);
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message = status === 400 ? error.message : `خطا در تحلیل: ${error.message}`;
    res.status(status).json({ error: message });
  }
}

export default analyzeFiles;
