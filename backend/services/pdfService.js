// Extract text from a PDF buffer using pdf-parse (imported dynamically so a
// missing optional dependency surfaces as a clear message rather than a crash).
export async function extractPdfText(buffer) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('ماژول pdf-parse نصب نیست. لطفاً npm install pdf-parse را اجرا کنید.');
    }
    throw new Error('خطا در استخراج متن از PDF: ' + error.message);
  }
}

export default extractPdfText;
