import fs from 'fs';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Point fluent-ffmpeg at the bundled static ffmpeg binary so no system install
// is required.
ffmpeg.setFfmpegPath(ffmpegStatic);

// Get a video's duration (in seconds) via ffprobe.
export function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

// Split a video into fixed-duration, re-encoded 480p segments.
export async function splitVideoIntoSegments(inputPath, outputDir, segmentDuration = 300) {
  // segmentDuration in seconds (default 5 minutes = 300 seconds)
  const duration = await getVideoDuration(inputPath);
  const segmentCount = Math.ceil(duration / segmentDuration);

  console.log(`Video duration: ${duration}s, splitting into ${segmentCount} segments of ${segmentDuration}s each`);

  const segments = [];

  for (let i = 0; i < segmentCount; i++) {
    const startTime = i * segmentDuration;
    const segmentPath = join(outputDir, `segment_${i}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(segmentDuration)
        .output(segmentPath)
        .outputOptions([
          '-c:v libx264',      // Re-encode video
          '-crf 28',           // Lower quality for smaller size
          '-preset fast',      // Fast encoding
          '-c:a aac',          // Audio codec
          '-b:a 64k',          // Lower audio bitrate
          '-vf scale=-2:480',  // Scale to 480p (keeps aspect ratio)
          '-movflags +faststart',
        ])
        .on('end', () => {
          console.log(`Segment ${i + 1}/${segmentCount} created: ${segmentPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error creating segment ${i}:`, err);
          reject(err);
        })
        .run();
    });

    segments.push({
      path: segmentPath,
      startTime: startTime,
      index: i,
    });
  }

  return segments;
}

// Extract audio only from a video (much smaller file size).
export async function extractAudioFromVideo(inputPath, outputDir) {
  const audioPath = join(outputDir, 'audio_only.mp3');

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(audioPath)
      .outputOptions([
        '-vn',           // No video
        '-acodec mp3',   // MP3 codec
        '-ab 64k',       // 64kbps bitrate
        '-ar 22050',     // 22kHz sample rate
      ])
      .on('end', () => {
        console.log(`Audio extracted: ${audioPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        reject(err);
      })
      .run();
  });

  return audioPath;
}

// Extract one key frame every `interval` seconds (for visual content).
export async function extractKeyFrames(inputPath, outputDir, interval = 30) {
  const framesDir = join(outputDir, 'frames');
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(join(framesDir, 'frame_%04d.jpg'))
      .outputOptions([
        `-vf fps=1/${interval}`,  // One frame per interval seconds
        '-q:v 5',                  // JPEG quality (1-31, lower is better)
      ])
      .on('end', () => {
        console.log(`Key frames extracted to: ${framesDir}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Error extracting frames:', err);
        reject(err);
      })
      .run();
  });

  // Get list of extracted frames
  const frames = fs.readdirSync(framesDir)
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => join(framesDir, f));

  return frames;
}
