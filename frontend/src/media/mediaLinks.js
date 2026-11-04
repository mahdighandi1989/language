// Purpose: turn a pasted media link into something playable on the lesson
// page — YouTube ⇒ privacy-enhanced embed, Google Drive file ⇒ its /preview
// player (works for files the viewer's Google account can open; no OAuth in
// the app), direct audio/video URL ⇒ <audio>/<video>. Anything else: rejected.
// Upstream: user input (untrusted ⇒ only https, only these shapes).

export function parseMediaLink(input) {
  let u;
  try { u = new URL(String(input || '').trim()); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:shorts|live|embed)\/([^/?#]+)/) || [])[1];
  }
  if (id) {
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
    const t = parseInt(u.searchParams.get('t') || u.searchParams.get('start') || '0', 10) || 0;
    return { kind: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}`, embed: `https://www.youtube-nocookie.com/embed/${id}${t ? `?start=${t}` : ''}` };
  }
  if (host === 'drive.google.com') {
    const m = u.pathname.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/) || [null, u.searchParams.get('id')];
    if (m[1] && /^[A-Za-z0-9_-]{10,}$/.test(m[1])) return { kind: 'drive', id: m[1], url: `https://drive.google.com/file/d/${m[1]}/view`, embed: `https://drive.google.com/file/d/${m[1]}/preview` };
    return null;
  }
  const ext = (u.pathname.split('.').pop() || '').toLowerCase();
  if (['mp3', 'm4a', 'aac', 'wav', 'ogg', 'opus', 'flac'].includes(ext)) return { kind: 'audio', url: u.href };
  if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return { kind: 'video', url: u.href };
  return null;
}

export function isPlayableFile(file) {
  const t = String(file?.type || file?.mime || '');
  const n = String(file?.name || '').toLowerCase();
  if (t.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|opus|flac|amr)$/.test(n)) return 'audio';
  if (t.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|3gp)$/.test(n)) return 'video';
  return null;
}
