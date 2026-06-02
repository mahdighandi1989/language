import fs from 'fs';

// Delete uploaded temp files from disk, ignoring (but logging) any failures so
// cleanup never throws and masks the original request outcome.
export function cleanupTempFiles(files) {
  if (!files || !Array.isArray(files)) return;
  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`Cleaned up temp file: ${file.path}`);
      } catch (err) {
        console.error(`Failed to cleanup temp file ${file.path}:`, err);
      }
    }
  }
}

export default cleanupTempFiles;
