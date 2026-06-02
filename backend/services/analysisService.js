import fs from 'fs';
import { join } from 'path';
import { ANALYSIS_SYSTEM_PROMPT } from './prompts.js';
import {
  analyzeWithGemini,
  uploadToGeminiFileAPI,
  analyzeWithGeminiFileAPI,
  analyzeWithGeminiFileAPIWithModel,
  deleteGeminiFile,
} from './geminiService.js';
import { extractPdfText } from './pdfService.js';
import { extractAudioFromVideo, extractKeyFrames } from './videoService.js';
import { splitIntoChunks } from '../utils/chunking.js';
import { cleanupTempFiles } from '../utils/fileCleanup.js';
import { uploadDir } from '../middleware/upload.js';

// Orchestrates the multi-modal analysis of uploaded files and/or raw text:
// PDFs, audio, video (with ffmpeg-based chunking for large files), images and
// plain text are each analyzed with Gemini and merged into a single result.
// Temp files are always cleaned up before returning. Returns
// { analysis, mediaItems, processedFiles }.
export async function analyzeUploads({ files = [], textContent = '', userInstructions = '' }) {
  console.log(`Files received: ${files.length}, Text length: ${textContent.length}`);

  if (files.length === 0 && !textContent.trim()) {
    const err = new Error('هیچ فایل یا متنی برای تحلیل ارسال نشده است');
    err.status = 400;
    throw err;
  }

  console.log(`Processing ${files.length} files and ${textContent.length} chars of text`);

  const allAnalysisResults = [];
  const mediaItems = []; // For embedding in notes

  // System prompt for analysis
  const systemPrompt = ANALYSIS_SYSTEM_PROMPT + (userInstructions ? `\n**دستورات کاربر:** ${userInstructions}` : '');

  try {
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
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ], systemPrompt);
            }

            allAnalysisResults.push(result);

            // Store audio for embedding (only if under 10MB)
            if (fileSizeMB <= 10 && base64Data) {
              mediaItems.push({
                type: 'audio',
                name: fileName,
                mimeType: mimeType,
                data: base64Data,
              });
            }
          } catch (audioError) {
            console.error(`Audio analysis error for ${fileName}:`, audioError);
            allAnalysisResults.push(`**خطا در تحلیل صوت "${fileName}":**\n${audioError.message}`);
          }

        } else if (mimeType.startsWith('video/')) {
          console.log(`Video file: ${fileName}, size: ${fileSizeMB.toFixed(2)} MB`);

          // Smart video analysis prompt
          const smartVideoPrompt = `
این یک ویدیوی آموزشی عربی لبنانی است. لطفاً به صورت هوشمند تحلیل کن:

**مرحله ۱ - شناسایی فریم‌های آموزشی:**
- فریم‌هایی که متن عربی/لبنانی دارند (اسلاید، زیرنویس، تخته)
- فریم‌هایی که نکات گرامری یا لغات نشان می‌دهند
- این فریم‌ها را با دقت بخوان و محتوایشان را استخراج کن

**مرحله ۲ - رونویسی صوت:**
- تمام گفتار عربی لبنانی را رونویسی کن
- اگر معلم توضیحی می‌دهد، آن را بنویس
- مکالمات و مثال‌ها را دقیق ثبت کن

**مرحله ۳ - ترکیب و تحلیل:**
- محتوای فریم‌های آموزشی را با صوت مرتبط ترکیب کن
- نکات کلیدی را استخراج کن
- اشتباهات احتمالی در محتوا را تصحیح کن

فایل: "${fileName}"
`;

          try {
            let result;

            // For very large videos (>50MB), use chunked processing
            if (fileSizeMB > 50) {
              console.log(`Large video detected (${fileSizeMB.toFixed(0)}MB). Using chunked processing with ffmpeg...`);

              // Create temp directory for video processing
              const videoTempDir = join(uploadDir, `video_${Date.now()}`);
              fs.mkdirSync(videoTempDir, { recursive: true });

              try {
                // Strategy: Extract audio + key frames for analysis
                // This is more efficient than splitting video into segments

                console.log('Step 1: Extracting audio from video...');
                const audioPath = await extractAudioFromVideo(filePath, videoTempDir);
                const audioSize = fs.statSync(audioPath).size / (1024 * 1024);
                console.log(`Audio extracted: ${audioSize.toFixed(2)} MB`);

                console.log('Step 2: Extracting key frames (every 15 seconds)...');
                const framePaths = await extractKeyFrames(filePath, videoTempDir, 15);
                console.log(`Extracted ${framePaths.length} key frames`);

                // Step 3: Analyze audio
                console.log('Step 3: Analyzing audio content...');
                let audioResult = '';
                const uploadedAudioFile = await uploadToGeminiFileAPI(audioPath, 'audio/mp3', `${fileName}_audio.mp3`);
                try {
                  audioResult = await analyzeWithGeminiFileAPIWithModel(
                    uploadedAudioFile,
                    `این فایل صوتی استخراج شده از یک ویدیوی آموزشی عربی لبنانی است.
لطفاً تمام گفتار را رونویسی کن و نکات آموزشی را استخراج کن.
اگر اشتباهی در تلفظ یا گرامر وجود دارد، تصحیح کن.`,
                    systemPrompt,
                    'gemini-2.0-flash'
                  );
                } finally {
                  await deleteGeminiFile(uploadedAudioFile);
                }
                console.log('Audio analysis complete');

                // Step 4: Analyze key frames in batches
                console.log('Step 4: Analyzing key frames for visual content...');
                const frameResults = [];
                const batchSize = 10; // Process 10 frames at a time

                for (let i = 0; i < framePaths.length; i += batchSize) {
                  const batch = framePaths.slice(i, i + batchSize);
                  console.log(`Analyzing frames ${i + 1} to ${Math.min(i + batchSize, framePaths.length)}...`);

                  // Build parts array with multiple images
                  const parts = [
                    { text: `این ${batch.length} فریم از ویدیوی آموزشی "${fileName}" است (فریم‌های ${i + 1} تا ${Math.min(i + batchSize, framePaths.length)} از ${framePaths.length}).
هر متن عربی/لبنانی که در این فریم‌ها می‌بینی را استخراج کن. اگر اسلاید، تخته، یا زیرنویس هست، محتوایش را بنویس.` },
                  ];

                  for (const framePath of batch) {
                    const frameData = fs.readFileSync(framePath).toString('base64');
                    parts.push({ inline_data: { mime_type: 'image/jpeg', data: frameData } });
                  }

                  try {
                    const frameResult = await analyzeWithGemini(parts,
                      'فقط متن‌های قابل مشاهده در تصاویر را استخراج کن. به فارسی پاسخ بده.');
                    if (frameResult && !frameResult.includes('متنی یافت نشد') && !frameResult.includes('هیچ متنی')) {
                      frameResults.push(frameResult);
                    }
                  } catch (frameErr) {
                    console.log(`Frame batch ${i} error:`, frameErr.message);
                  }
                }
                console.log(`Frame analysis complete. Found content in ${frameResults.length} batches`);

                // Step 5: Merge audio and frame results
                console.log('Step 5: Merging results...');
                const mergeContent = `
**نتایج تحلیل صوت:**
${audioResult}

**نتایج تحلیل فریم‌های آموزشی:**
${frameResults.length > 0 ? frameResults.join('\n\n---\n\n') : 'متن قابل مشاهده‌ای در فریم‌ها یافت نشد.'}
`;

                result = await analyzeWithGemini(
                  [{ text: `لطفاً این نتایج تحلیل ویدیوی "${fileName}" را ادغام و سازماندهی کن:\n${mergeContent}` }],
                  systemPrompt
                );

              } finally {
                // Cleanup temp directory
                try {
                  fs.rmSync(videoTempDir, { recursive: true, force: true });
                  console.log(`Cleaned up video temp directory: ${videoTempDir}`);
                } catch (cleanErr) {
                  console.error('Error cleaning up video temp:', cleanErr);
                }
              }

            } else if (isLargeFile) {
              // For medium videos (15-50MB), try direct upload first
              console.log(`Using File API for video: ${fileName}`);
              const uploadedFileName = await uploadToGeminiFileAPI(filePath, mimeType, fileName, fileSize);

              try {
                result = await analyzeWithGeminiFileAPIWithModel(
                  uploadedFileName,
                  smartVideoPrompt,
                  systemPrompt,
                  'gemini-2.0-flash'
                );
              } finally {
                await deleteGeminiFile(uploadedFileName);
              }

            } else {
              // For smaller videos (<15MB), use inline data
              console.log(`Analyzing video inline: ${fileName}`);
              result = await analyzeWithGemini([
                { text: smartVideoPrompt },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ], systemPrompt);
            }

            allAnalysisResults.push(result);

            // Store video for embedding (only small ones for playback)
            if (fileSizeMB <= 10 && base64Data) {
              mediaItems.push({
                type: 'video',
                name: fileName,
                mimeType: mimeType,
                data: base64Data,
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
                data: base64Data,
              });
            }
          }

        } else if (mimeType.startsWith('image/')) {
          // Analyze image - read from disk if needed
          const imgBase64 = isLargeFile ? fs.readFileSync(filePath).toString('base64') : base64Data;

          const result = await analyzeWithGemini([
            { text: `این یک تصویر به نام "${fileName}" است. هر متن عربی/لبنانی که در تصویر می‌بینی را استخراج و تحلیل کن:` },
            { inline_data: { mime_type: mimeType, data: imgBase64 } },
          ], systemPrompt);

          allAnalysisResults.push(result);

          // Store image for embedding (only if small enough)
          if (fileSizeMB <= 5) {
            mediaItems.push({
              type: 'image',
              name: fileName,
              mimeType: mimeType,
              data: imgBase64,
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

    return {
      success: true,
      analysis: finalAnalysis,
      mediaItems: mediaItems, // Return media for embedding in lesson
      processedFiles: files.map((f) => f.originalname),
    };
  } finally {
    // Always cleanup uploaded temp files, whether analysis succeeded or threw.
    cleanupTempFiles(files);
  }
}

export default analyzeUploads;
