import fs from 'fs';
import { GEMINI_API_KEY } from '../config/env.js';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com';

// Analyze content with Gemini (text, audio, image, video) using inline parts.
export async function analyzeWithGemini(parts, systemPrompt) {
  const apiUrl = `${GEMINI_BASE}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{ role: 'user', parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Upload a large file to the Gemini File API (supports both buffer and file
// path), polling until the file is processed, and return its resource name.
export async function uploadToGeminiFileAPI(filePathOrBuffer, mimeType, displayName, fileSize = null) {
  const isFilePath = typeof filePathOrBuffer === 'string';
  const actualSize = fileSize || (isFilePath ? fs.statSync(filePathOrBuffer).size : filePathOrBuffer.length);

  console.log(`Uploading file to Gemini File API: ${displayName}, size: ${(actualSize / 1024 / 1024).toFixed(2)} MB, from: ${isFilePath ? 'disk' : 'memory'}`);

  // Step 1: Start resumable upload
  const startUploadUrl = `${GEMINI_BASE}/upload/v1beta/files?key=${GEMINI_API_KEY}`;

  const startResponse = await fetch(startUploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': actualSize.toString(),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: { display_name: displayName },
    }),
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
      'Content-Type': mimeType,
    },
    body: uploadBody,
    duplex: 'half', // Required for streaming body in Node.js fetch
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
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(
      `${GEMINI_BASE}/v1beta/${fileName}?key=${GEMINI_API_KEY}`
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

// Analyze a large uploaded file using the Gemini File API with a specific model.
export async function analyzeWithGeminiFileAPIWithModel(fileUri, prompt, systemPrompt, modelName) {
  const apiUrl = `${GEMINI_BASE}/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
  console.log(`Using model: ${modelName} for file analysis`);

  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { file_data: { file_uri: `${GEMINI_BASE}/v1beta/${fileUri}` } },
      ],
    }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Analyze a large uploaded file using the Gemini File API (default model).
export async function analyzeWithGeminiFileAPI(fileUri, prompt, systemPrompt, useExtendedModel = false) {
  const model = useExtendedModel ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
  return analyzeWithGeminiFileAPIWithModel(fileUri, prompt, systemPrompt, model);
}

// Delete a file from the Gemini File API. Failures are logged, never thrown.
export async function deleteGeminiFile(fileName) {
  try {
    await fetch(
      `${GEMINI_BASE}/v1beta/${fileName}?key=${GEMINI_API_KEY}`,
      { method: 'DELETE' }
    );
    console.log(`Deleted file: ${fileName}`);
  } catch (err) {
    console.error(`Failed to delete file ${fileName}:`, err);
  }
}
