// Audio helpers extracted from the former monolithic src/App.jsx. Pure,
// browser-only utilities with no React or app-state dependencies.

// Creates a short beep sound using the Web Audio API. Resolves when the tone
// has finished (or immediately on error — audio is best-effort).
export function playBeepSound(frequency = 800, duration = 150) {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Fade in and out to avoid clicks
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      oscillator.onended = () => {
        audioContext.close();
        resolve();
      };
    } catch (e) {
      console.error('Beep sound error:', e);
      resolve();
    }
  });
}

// Converts base64-encoded raw PCM (as returned by the Gemini TTS endpoint) into
// a playable WAV object URL. `mimeType` carries the sample rate (e.g.
// "audio/L16;rate=24000").
export const getWavUrl = (base64, mimeType) => {
    const sampleRateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
    const base64ToArrayBuffer = (base64) => { const s = window.atob(base64), l = s.length, b = new Uint8Array(l); for (let i = 0; i < l; i++) b[i] = s.charCodeAt(i); return b.buffer; };
    const pcmToWav = (pcm, rate) => { const d = pcm.byteLength, b = new ArrayBuffer(44 + d), v = new DataView(b); v.setUint32(0, 1380533830, false); v.setUint32(4, 36 + d, true); v.setUint32(8, 1463899717, false); v.setUint32(12, 1718449184, false); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); v.setUint32(36, 1684108385, false); v.setUint32(40, d, true); const p = new Int16Array(pcm); for (let i = 0; i < p.length; i++) v.setInt16(44 + i * 2, p[i], true); return new Blob([v], { type: 'audio/wav' }); };
    const pcmData = base64ToArrayBuffer(base64);
    const wavBlob = pcmToWav(pcmData, sampleRate);
    return URL.createObjectURL(wavBlob);
};
