import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import fs from 'fs';
import os from 'os';

dotenv.config();

// Configure multer for disk storage (for large files)
const uploadDir = join(os.tmpdir(), 'lebanese-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max per file
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws/live' });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini Chat API
app.post('/api/gemini/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const payload = req.body;
    const includeAudio = payload.includeAudio;
    delete payload.includeAudio;

    // Clean payload - preserve audio data if includeAudio flag is set
    if (payload.contents) {
      payload.contents = payload.contents.map(content => ({
        role: content.role,
        parts: content.parts.map(part => {
          // Keep inline_data (audio) if present
          if (part.inline_data && includeAudio) {
            return { inline_data: part.inline_data };
          }
          // Keep text if present
          if (part.text !== undefined) {
            return { text: part.text };
          }
          return null;
        }).filter(p => p !== null)
      }));
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const result = await response.json();

    // Return full result for audio requests, just text otherwise
    if (includeAudio) {
      res.json(result);
    } else {
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return res.status(500).json({ error: 'No text in response' });
      }
      res.json({ text });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gemini TTS API
app.post('/api/gemini/tts', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { prompt, voice = 'Kore' } = req.body;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: voice } 
          } 
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const result = await response.json();
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType?.startsWith("audio/")) {
      res.json({ audioData, mimeType });
    } else {
      res.status(500).json({ error: 'Invalid audio data' });
    }
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available models
app.get('/api/list-models', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
    }

    // Return just model names for easier reading
    const modelNames = data.models?.map(m => m.name) || [];
    res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Gemini API directly
app.get('/api/test-gemini', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured', keyExists: false });
  }

  try {
    const testPayload = {
      contents: [{ role: 'user', parts: [{ text: 'Say hello in Lebanese Arabic' }] }]
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    console.log('Gemini test response status:', response.status);
    console.log('Gemini test response:', responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Gemini API failed',
        status: response.status,
        response: responseText,
        keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
      });
    }

    const result = JSON.parse(responseText);
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({
      success: true,
      text: text,
      keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FILE ANALYSIS API
// ============================================

// Helper: Split large content into chunks
function splitIntoChunks(content, maxChunkSize = 30000) {
  if (content.length <= maxChunkSize) return [content];

  const chunks = [];
  let remaining = content;

  while (remaining.length > 0) {
    // Try to split at a natural break point (newline, period, space)
    let splitPoint = maxChunkSize;
    if (remaining.length > maxChunkSize) {
      const lastNewline = remaining.lastIndexOf('\n', maxChunkSize);
      const lastPeriod = remaining.lastIndexOf('.', maxChunkSize);
      const lastSpace = remaining.lastIndexOf(' ', maxChunkSize);

      splitPoint = Math.max(lastNewline, lastPeriod, lastSpace);
      if (splitPoint < maxChunkSize * 0.5) splitPoint = maxChunkSize; // No good break found
    }

    chunks.push(remaining.substring(0, splitPoint));
    remaining = remaining.substring(splitPoint).trim();
  }

  return chunks;
}

// Helper: Analyze content with Gemini (text, audio, image, video)
async function analyzeWithGemini(parts, systemPrompt) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{ role: 'user', parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Helper: Upload large file to Gemini File API (supports both buffer and file path)
async function uploadToGeminiFileAPI(filePathOrBuffer, mimeType, displayName, fileSize = null) {
  const isFilePath = typeof filePathOrBuffer === 'string';
  const actualSize = fileSize || (isFilePath ? fs.statSync(filePathOrBuffer).size : filePathOrBuffer.length);

  console.log(`Uploading file to Gemini File API: ${displayName}, size: ${(actualSize / 1024 / 1024).toFixed(2)} MB, from: ${isFilePath ? 'disk' : 'memory'}`);

  // Step 1: Start resumable upload
  const startUploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`;

  const startResponse = await fetch(startUploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': actualSize.toString(),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file: { display_name: displayName }
    })
  });

  if (!startResponse.ok) {
    const error = await startResponse.text();
    throw new Error(`Failed to start upload: ${error}`);
  }

  const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
  if (!uploadUrl) {
    throw new Error('No upload URL received');
  }

  // Step 2: Upload the file data (stream from disk if file path)
  console.log('Uploading file data...');

  let uploadBody;
  if (isFilePath) {
    // Stream from disk to avoid loading entire file into memory
    uploadBody = fs.createReadStream(filePathOrBuffer);
  } else {
    uploadBody = filePathOrBuffer;
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Command': 'upload, finalize',
      'X-Goog-Upload-Offset': '0',
      'Content-Type': mimeType
    },
    body: uploadBody,
    duplex: 'half' // Required for streaming body in Node.js fetch
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Failed to upload file: ${error}`);
  }

  const fileInfo = await uploadResponse.json();
  console.log('File uploaded successfully:', fileInfo.file?.name);

  // Step 3: Wait for file to be processed
  const fileName = fileInfo.file?.name;
  if (!fileName) {
    throw new Error('No file name in response');
  }

  // Poll for file state
  let fileState = fileInfo.file?.state;
  let attempts = 0;
  const maxAttempts = 60; // Max 5 minutes (60 * 5 seconds)

  while (fileState === 'PROCESSING' && attempts < maxAttempts) {
    console.log(`File processing... (attempt ${attempts + 1})`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`
    );

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      fileState = statusData.state;
      console.log(`File state: ${fileState}`);
    }
    attempts++;
  }

  if (fileState !== 'ACTIVE') {
    throw new Error(`File processing failed or timed out. State: ${fileState}`);
  }

  return fileName; // Returns something like "files/abc123"
}

// Helper: Analyze large file using Gemini File API
async function analyzeWithGeminiFileAPI(fileUri, prompt, systemPrompt) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { file_data: { file_uri: `https://generativelanguage.googleapis.com/v1beta/${fileUri}` } }
      ]
    }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Helper: Delete file from Gemini File API
async function deleteGeminiFile(fileName) {
  try {
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`,
      { method: 'DELETE' }
    );
    console.log(`Deleted file: ${fileName}`);
  } catch (err) {
    console.error(`Failed to delete file ${fileName}:`, err);
  }
}

// Helper: Extract text from PDF using pdf-parse
async function extractPdfText(buffer) {
  try {
    // Try to dynamically import pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // If pdf-parse is not installed or fails, return a message
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('ماژول pdf-parse نصب نیست. لطفاً npm install pdf-parse را اجرا کنید.');
    }
    throw new Error('خطا در استخراج متن از PDF: ' + error.message);
  }
}

// Lebanese Arabic correction prompt
const LEBANESE_CORRECTION_PROMPT = `
=== قواعد تصحیح عربی لبنانی ===
هنگام تحلیل محتوا، اشتباهات رایج را بر اساس این قواعد تصحیح کن:

1. تبدیل حروف لبنانی:
   - قاف → همزه: قال=آل، قلب=ألب، قهوة=أهوة
   - ثاء → ت یا س: ثلاثة=تلاتة، كثير=كتير
   - ذال → د یا ز: هذا=هيدا، لذيذ=لزيز

2. واژگان صحیح لبنانی:
   - "ماذا" → "شو"
   - "كيف حالك" → "كيفك"
   - "الآن" → "هلأ/هلق"
   - "جيد" → "منيح"
   - "كثيراً" → "كتير"
   - "لماذا" → "ليش"
   - "أين" → "وين"
   - "أريد" → "بدّي"
   - "هذا/هذه" → "هيدا/هيدي"

3. ساختار فعل لبنانی:
   - مضارع مستمر: عم + فعل (عم بحكي)
   - آینده: رح + فعل (رح روح)
   - نفی: ما + فعل (ما بعرف)

اگر در محتوا اشتباهی دیدی، آن را در بخش جداگانه‌ای با عنوان "**تصحیحات:**" ذکر کن.
`;

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم فایل بیش از حد مجاز است (حداکثر 500MB)' });
    }
    return res.status(400).json({ error: `خطای آپلود: ${err.message}` });
  }
  next(err);
};

// Main file analysis endpoint
app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
  console.log('Received file analysis request');

  if (!GEMINI_API_KEY) {
    console.error('API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const files = req.files || [];
    const textContent = req.body.textContent || '';
    const userInstructions = req.body.userInstructions || '';

    console.log(`Files received: ${files.length}, Text length: ${textContent.length}`);

    if (files.length === 0 && !textContent.trim()) {
      return res.status(400).json({ error: 'هیچ فایل یا متنی برای تحلیل ارسال نشده است' });
    }

    console.log(`Processing ${files.length} files and ${textContent.length} chars of text`);

    // Collect all content parts for analysis
    const allAnalysisResults = [];
    const mediaItems = []; // For embedding in notes

    // System prompt for analysis
    const systemPrompt = `تو یک تحلیلگر زبان‌شناسی متخصص برای دانش‌آموز فارسی‌زبانی هستی که عربی لبنانی یاد می‌گیرد.

وظیفه‌ات:
1. محتوا را به دقت بررسی کن (متن، صوت، تصویر، ویدیو)
2. اشتباهات عربی لبنانی را بر اساس قواعد زیر تصحیح کن
3. نکات کلیدی را استخراج و دسته‌بندی کن

${LEBANESE_CORRECTION_PROMPT}

=== فرمت خروجی (به فارسی) ===

**لغات و اصطلاحات جدید:**
- [کلمه لبنانی]: [معنی فارسی]

**نکات گرامری کلیدی:**
- [توضیح قاعده]

**عبارات کاربردی:**
- [عبارت لبنانی]: [معنی فارسی]

**تصحیحات:**
- [اگر اشتباهی در محتوا بود، اینجا ذکر کن]

${userInstructions ? `\n**دستورات کاربر:** ${userInstructions}` : ''}`;

    // Process each file
    for (const file of files) {
      const mimeType = file.mimetype;
      const fileName = file.originalname;
      const filePath = file.path; // Disk storage path
      const fileSize = file.size;
      const fileSizeMB = fileSize / (1024 * 1024);

      console.log(`Processing file: ${fileName}, type: ${mimeType}, size: ${fileSizeMB.toFixed(2)} MB, path: ${filePath}`);

      // For large files (>15MB), use Gemini File API directly without loading into memory
      const isLargeFile = fileSizeMB > 15;

      // Only read file into memory for small files
      let fileBuffer = null;
      let base64Data = null;

      if (!isLargeFile) {
        try {
          fileBuffer = fs.readFileSync(filePath);
          base64Data = fileBuffer.toString('base64');
        } catch (readErr) {
          console.error(`Error reading file ${fileName}:`, readErr);
          allAnalysisResults.push(`**خطا در خواندن فایل "${fileName}":** ${readErr.message}`);
          continue;
        }
      }

      try {
        if (mimeType === 'application/pdf') {
          // Extract text from PDF - need to read from disk for large files
          const pdfBuffer = isLargeFile ? fs.readFileSync(filePath) : fileBuffer;
          const pdfText = await extractPdfText(pdfBuffer);

          if (pdfText.length > 50000) {
            // Chunk large PDFs
            const chunks = splitIntoChunks(pdfText, 30000);
            console.log(`PDF split into ${chunks.length} chunks`);

            const chunkResults = [];
            for (let i = 0; i < chunks.length; i++) {
              console.log(`Analyzing PDF chunk ${i + 1}/${chunks.length}`);
              const chunkResult = await analyzeWithGemini(
                [{ text: `محتوای فایل PDF "${fileName}" (بخش ${i + 1} از ${chunks.length}):\n\n${chunks[i]}` }],
                systemPrompt
              );
              chunkResults.push(chunkResult);
            }

            // Merge chunk results
            const mergePrompt = `این نتایج تحلیل چند بخش از یک فایل است. آنها را ادغام کن و موارد تکراری را حذف کن. خروجی را به همان فرمت (لغات، گرامر، عبارات) ارائه بده:`;
            const mergedResult = await analyzeWithGemini(
              [{ text: mergePrompt + '\n\n' + chunkResults.join('\n\n---\n\n') }],
              'محتوا را ادغام و خلاصه کن. به فارسی پاسخ بده.'
            );
            allAnalysisResults.push(mergedResult);
          } else {
            const result = await analyzeWithGemini(
              [{ text: `محتوای فایل PDF "${fileName}":\n\n${pdfText}` }],
              systemPrompt
            );
            allAnalysisResults.push(result);
          }

        } else if (mimeType.startsWith('audio/')) {
          console.log(`Audio file: ${fileName}, size: ${fileSizeMB.toFixed(2)} MB`);

          try {
            let result;

            if (isLargeFile) {
              // For large audio files, use Gemini File API with streaming
              console.log(`Using File API for large audio: ${fileName}`);
              const uploadedFileName = await uploadToGeminiFileAPI(filePath, mimeType, fileName, fileSize);

              try {
                result = await analyzeWithGeminiFileAPI(
                  uploadedFileName,
                  `این یک فایل صوتی به نام "${fileName}" است. لطفاً آن را رونویسی کن و سپس محتوا را تحلیل کن:`,
                  systemPrompt
                );
              } finally {
                await deleteGeminiFile(uploadedFileName);
              }
            } else {
              // For smaller audio, use inline data
              result = await analyzeWithGemini([
                { text: `این یک فایل صوتی به نام "${fileName}" است. لطفاً آن را رونویسی کن و سپس محتوا را تحلیل کن:` },
                { inline_data: { mime_type: mimeType, data: base64Data } }
              ], systemPrompt);
            }

            allAnalysisResults.push(result);

            // Store audio for embedding (only if under 10MB)
            if (fileSizeMB <= 10 && base64Data) {
              mediaItems.push({
                type: 'audio',
                name: fileName,
                mimeType: mimeType,
                data: base64Data
              });
            }
          } catch (audioError) {
            console.error(`Audio analysis error for ${fileName}:`, audioError);
            allAnalysisResults.push(`**خطا در تحلیل صوت "${fileName}":**\n${audioError.message}`);
          }

        } else if (mimeType.startsWith('video/')) {
          console.log(`Video file: ${fileName}, size: ${fileSizeMB.toFixed(2)} MB`);

          try {
            let result;

            if (isLargeFile) {
              // For large videos, use Gemini File API with streaming
              console.log(`Using File API for large video: ${fileName}`);
              const uploadedFileName = await uploadToGeminiFileAPI(filePath, mimeType, fileName, fileSize);

              try {
                result = await analyzeWithGeminiFileAPI(
                  uploadedFileName,
                  `این یک فایل ویدیویی به نام "${fileName}" است. لطفاً محتوای صوتی آن را رونویسی کن و متن‌های قابل مشاهده را استخراج کن، سپس تحلیل کن:`,
                  systemPrompt
                );
              } finally {
                // Clean up uploaded file
                await deleteGeminiFile(uploadedFileName);
              }
            } else {
              // For smaller videos, use inline data
              console.log(`Analyzing video inline: ${fileName}`);
              result = await analyzeWithGemini([
                { text: `این یک فایل ویدیویی به نام "${fileName}" است. لطفاً محتوای صوتی آن را رونویسی کن و متن‌های قابل مشاهده را استخراج کن، سپس تحلیل کن:` },
                { inline_data: { mime_type: mimeType, data: base64Data } }
              ], systemPrompt);
            }

            allAnalysisResults.push(result);

            // Store video for embedding (only small ones for playback)
            if (fileSizeMB <= 10 && base64Data) {
              mediaItems.push({
                type: 'video',
                name: fileName,
                mimeType: mimeType,
                data: base64Data
              });
            }
          } catch (videoError) {
            console.error(`Video analysis error for ${fileName}:`, videoError);
            allAnalysisResults.push(`**خطا در تحلیل ویدیو "${fileName}":**\n${videoError.message}`);

            // Still store for embedding if small enough
            if (fileSizeMB <= 10 && base64Data) {
              mediaItems.push({
                type: 'video',
                name: fileName,
                mimeType: mimeType,
                data: base64Data
              });
            }
          }

        } else if (mimeType.startsWith('image/')) {
          // Analyze image - read from disk if needed
          const imgBase64 = isLargeFile ? fs.readFileSync(filePath).toString('base64') : base64Data;

          const result = await analyzeWithGemini([
            { text: `این یک تصویر به نام "${fileName}" است. هر متن عربی/لبنانی که در تصویر می‌بینی را استخراج و تحلیل کن:` },
            { inline_data: { mime_type: mimeType, data: imgBase64 } }
          ], systemPrompt);

          allAnalysisResults.push(result);

          // Store image for embedding (only if small enough)
          if (fileSizeMB <= 5) {
            mediaItems.push({
              type: 'image',
              name: fileName,
              mimeType: mimeType,
              data: imgBase64
            });
          }

        } else if (mimeType.startsWith('text/') || mimeType === 'application/json') {
          // Plain text files - read from disk if needed
          const textFromFile = isLargeFile ? fs.readFileSync(filePath, 'utf-8') : fileBuffer.toString('utf-8');
          const result = await analyzeWithGemini(
            [{ text: `محتوای فایل متنی "${fileName}":\n\n${textFromFile}` }],
            systemPrompt
          );
          allAnalysisResults.push(result);

        } else {
          console.log(`Unsupported file type: ${mimeType}`);
          allAnalysisResults.push(`**فایل "${fileName}":**\nنوع فایل پشتیبانی نمی‌شود (${mimeType}).`);
        }

      } catch (fileError) {
        console.error(`Error processing file ${fileName}:`, fileError);
        allAnalysisResults.push(`**خطا در پردازش "${fileName}":**\n${fileError.message}`);
      }
    }

    // Process text content if provided
    if (textContent.trim()) {
      if (textContent.length > 50000) {
        const chunks = splitIntoChunks(textContent, 30000);
        console.log(`Text content split into ${chunks.length} chunks`);

        const chunkResults = [];
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Analyzing text chunk ${i + 1}/${chunks.length}`);
          const chunkResult = await analyzeWithGemini(
            [{ text: `متن برای تحلیل (بخش ${i + 1} از ${chunks.length}):\n\n${chunks[i]}` }],
            systemPrompt
          );
          chunkResults.push(chunkResult);
        }

        // Merge results
        const mergePrompt = `این نتایج تحلیل چند بخش از یک متن است. آنها را ادغام کن:`;
        const mergedResult = await analyzeWithGemini(
          [{ text: mergePrompt + '\n\n' + chunkResults.join('\n\n---\n\n') }],
          'محتوا را ادغام کن. به فارسی پاسخ بده.'
        );
        allAnalysisResults.push(mergedResult);
      } else {
        const result = await analyzeWithGemini(
          [{ text: `متن برای تحلیل:\n\n${textContent}` }],
          systemPrompt
        );
        allAnalysisResults.push(result);
      }
    }

    // Combine all results
    let finalAnalysis = allAnalysisResults.join('\n\n---\n\n');

    // If multiple sources, create a final merged summary
    if (allAnalysisResults.length > 1) {
      console.log('Merging multiple analysis results');
      const mergePrompt = `این نتایج تحلیل از چندین منبع مختلف است. لطفاً آنها را در یک خروجی منظم ادغام کن، موارد تکراری را حذف کن، و ساختار نهایی را به این فرمت ارائه بده:

**لغات و اصطلاحات جدید:**
**نکات گرامری کلیدی:**
**عبارات کاربردی:**
**تصحیحات:**`;

      finalAnalysis = await analyzeWithGemini(
        [{ text: mergePrompt + '\n\n' + finalAnalysis }],
        'محتوا را ادغام و سازماندهی کن. به فارسی پاسخ بده.'
      );
    }

    // Cleanup temp files
    cleanupTempFiles(files);

    res.json({
      success: true,
      analysis: finalAnalysis,
      mediaItems: mediaItems, // Return media for embedding in lesson
      processedFiles: files.map(f => f.originalname)
    });

  } catch (error) {
    console.error('File analysis error:', error);
    // Cleanup temp files even on error
    if (req.files) cleanupTempFiles(req.files);
    res.status(500).json({ error: `خطا در تحلیل: ${error.message}` });
  }
});

// Helper: Cleanup uploaded temp files
function cleanupTempFiles(files) {
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

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});

// ============================================
// GEMINI LIVE API WEBSOCKET PROXY
// ============================================

const GEMINI_LIVE_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_LIVE_WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

wss.on('connection', (clientWs) => {
  console.log('Client connected to Live API proxy');
  let geminiWs = null;
  let isSetupSent = false;

  // Connect to Gemini Live API
  const geminiUrl = `${GEMINI_LIVE_WS_URL}?key=${GEMINI_API_KEY}`;

  try {
    geminiWs = new WebSocket(geminiUrl);
  } catch (error) {
    console.error('Failed to create Gemini WebSocket:', error);
    clientWs.send(JSON.stringify({ error: 'Failed to connect to Gemini Live API' }));
    clientWs.close();
    return;
  }

  const sendSetupMessage = (voiceName = 'Charon', context = '', accentMode = 'authentic', corrections = '') => {
    if (isSetupSent) return;
    isSetupSent = true;

    // Build context-aware system instruction
    let contextPart = '';
    if (context) {
      contextPart = `\n\nسياق المحادثة الحالية:\n${context}\nركز على هيدا الموضوع بالمحادثة.\n`;
    }

    // Add pronunciation corrections if any
    let correctionsPart = '';
    if (corrections) {
      correctionsPart = `\n\n${corrections}\n`;
    }

    // Adjust instruction based on accent mode
    const accentInstruction = accentMode === 'simplified'
      ? 'حاول تحكي ببطء وبوضوح حتى الطالب يفهم. '
      : 'احكي بطريقة طبيعية متل شب لبناني حقيقي. ';

    const systemText = `انت جاد، شب لبناني من بيروت عمرك 28 سنة. انت معلم لهجة لبنانية لطالب أجنبي.
${contextPart}${correctionsPart}
مهم كتير كتير: لازم تحكي باللهجة اللبنانية البيروتية بس! ممنوع الفصحى نهائياً!
${accentInstruction}

=== قواعد النطق اللبناني الأساسية ===

1. تحويل الحروف - مهم جداً للهجة:
   - القاف → همزة: قال=آل، قلب=ألب، قهوة=أهوة، قمر=أمر
   - الثاء → ت أو س: ثلاثة=تلاتة، ثاني=تاني، كثير=كتير
   - الذال → د أو ز: هذا=هيدا، ذهب=دهب، لذيذ=لزيز
   - الضاد أحياناً → ظ أو د: بيضة=بيظة

2. تقصير وإيقاع الكلام:
   - احذف الحركات القصيرة: كِتاب=كتاب (بسكون)
   - مدّ الألفات: آه، هلأ، شو، ليش
   - الكلام سريع وخفيف مش ثقيل

=== المفردات اللبنانية الأساسية - استخدمها دائماً ===

بدل "ماذا/ما": شو
بدل "كيف حالك": كيفك
بدل "الآن": هلأ، هلق
بدل "جيد/حسن": منيح، تمام
بدل "جداً/كثيراً": كتير
بدل "لماذا": ليش
بدل "أين": وين
بدل "أريد": بدّي
بدل "تريد": بدّك
بدل "هذا": هيدا
بدل "هذه": هيدي
بدل "هؤلاء": هودي، هول
بدل "أستطيع": فيّي
بدل "تستطيع": فيك
بدل "لا أستطيع": ما فيّي
بدل "لا أعرف": ما بعرف
بدل "نعم": إي، أي
بدل "لا": لأ

=== الأفعال بالطريقة اللبنانية ===

المضارع المستمر = عم + فعل:
"شو عم تعمل؟" "عم بحكي" "عم ناكل"

المستقبل = رح + فعل:
"رح روح" "رح نحكي" "رح تتعلم"

النفي = ما + فعل:
"ما بعرف" "ما فهمت" "ما فيي"

=== تعابير لبنانية شائعة - استخدمها بكثرة ===

يلا = هيا، تشجيع
خلص = انتهى، كفى
بس = فقط، لكن
كمان = أيضاً
شي = شيء
هيك = هكذا
طيب = حسناً
ماشي = موافق
عنجد = حقاً
أكيد = بالتأكيد
والله = للتأكيد
يعني = للتوضيح
متل = مثل
أحسن = أفضل

=== نماذج جمل لبنانية صحيحة ===

"أهلا فيك! كيفك اليوم؟"
"شو اسمك؟ من وين انت؟"
"كتير منيح! برافو عليك!"
"ما فهمت، فيك تعيد؟"
"يلا نكمل"
"شو بدك تتعلم؟"
"هيدي كلمة جديدة"
"طيب، رح نحكي شوي"
"عنجد كتير شاطر!"
"إي هيك، تمام!"

=== أسلوب المحادثة ===

- ردودك قصيرة وطبيعية (جملة أو جملتين)
- استخدم "يا" للنداء: "كيفك يا صديقي؟"
- كن ودود ومشجع
- اضحك وامزح أحياناً
- استخدم التعابير العامية كثيراً

=== قواعد مهمة جداً ===

- ممنوع تقول "خلصنا" أو "كفاية لليوم" أو "تعبت" - استمر بالمحادثة دائماً!
- ممنوع تنهي المحادثة من عندك - الطالب هو يلي بيقرر متى يخلص
- دائماً اسأل سؤال جديد أو كمّل الحديث
- لا تفترض إنو الطالب تعبان أو بدو يوقف

تذكر: انت شب لبناني حقيقي من بيروت. احكي متل ما بتحكي مع رفقاتك. خليك طبيعي ودافئ. كل كلمة لازم تكون لبنانية 100% - ممنوع الفصحى!`;

    const setupMessage = {
      setup: {
        model: `models/${GEMINI_LIVE_MODEL}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: {
          parts: [{ text: systemText }]
        }
      }
    };

    console.log('Sending setup with voice:', voiceName, 'context:', context ? 'yes' : 'no', 'accentMode:', accentMode);
    geminiWs.send(JSON.stringify(setupMessage));
  };

  geminiWs.on('open', () => {
    console.log('Connected to Gemini Live API WebSocket');
    // Notify client that WebSocket is connected, waiting for voice selection
    clientWs.send(JSON.stringify({ type: 'ws_ready', message: 'Ready for setup' }));
  });

  geminiWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received from Gemini:', JSON.stringify(message).substring(0, 300));

      // When setup is complete, notify client that we're ready
      if (message.setupComplete) {
        console.log('Gemini setup complete - ready for audio');
        clientWs.send(JSON.stringify({ type: 'connected', message: 'Gemini Live API ready' }));
      }

      // Forward Gemini response to client
      clientWs.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error parsing Gemini message:', error);
    }
  });

  geminiWs.on('error', (error) => {
    console.error('Gemini WebSocket error:', error.message);
    clientWs.send(JSON.stringify({ error: `خطا در Gemini Live: ${error.message}` }));
  });

  geminiWs.on('close', (code, reason) => {
    const reasonStr = reason?.toString() || 'Unknown';
    console.log('Gemini connection closed - Code:', code, 'Reason:', reasonStr);
    clientWs.send(JSON.stringify({
      type: 'disconnected',
      error: `اتصال Gemini قطع شد (${code}): ${reasonStr}`
    }));
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });

  // Handle messages from client
  clientWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // Handle setup request with voice selection and context
      if (message.type === 'setup') {
        console.log('Client requested setup with voice:', message.voice, 'context:', message.context || 'none', 'corrections:', message.corrections ? 'yes' : 'no');
        sendSetupMessage(message.voice || 'Charon', message.context || '', message.accentMode || 'authentic', message.corrections || '');
        return;
      }

      // Forward audio to Gemini
      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error handling client message:', error);
    }
  });

  clientWs.on('close', () => {
    console.log('Client disconnected');
    if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('Client WebSocket error:', error);
  });
});

// Use server.listen instead of app.listen for WebSocket support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
