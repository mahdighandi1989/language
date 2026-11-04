// Purpose: «هم‌زمان فقط یکی» — whenever any <audio>/<video> (in the page or a
// detached `new Audio()`) starts playing, the one that was playing before is
// paused. Installed once at start-up by wrapping HTMLMediaElement.play; the
// Gemini Live call uses Web Audio (not media elements) and is unaffected.
// Returns an uninstall function (tests).

let current = null;
let installed = false;

export function installSingleMedia(proto = (typeof HTMLMediaElement !== 'undefined' ? HTMLMediaElement.prototype : null)) {
  if (!proto || installed) return () => {};
  installed = true;
  const original = proto.play;
  proto.play = function playOne(...args) {
    if (current && current !== this) {
      try { if (!current.paused) current.pause(); } catch { /* detached or gone */ }
    }
    current = this;
    const onEnd = () => { if (current === this) current = null; };
    try { this.addEventListener?.('ended', onEnd, { once: true }); } catch { /* ignore */ }
    return original.apply(this, args);
  };
  return () => { proto.play = original; installed = false; current = null; };
}
