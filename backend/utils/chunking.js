// Split large content into chunks no larger than maxChunkSize, preferring to
// break at a natural boundary (newline, period, space) when one is available.
export function splitIntoChunks(content, maxChunkSize = 30000) {
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

export default splitIntoChunks;
