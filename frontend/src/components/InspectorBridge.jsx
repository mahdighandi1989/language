// InspectorBridge — the safety bridge between AI-issued commands and the live
// page. The Gemini Live model can emit structured commands (e.g. a "click"
// carrying a CSS selector, or a "navigate" carrying a URL). Acting on those
// blindly lets a malformed or hostile selector (e.g. "body *") freeze the page,
// or an untrusted/`javascript:` URL trigger an open-redirect or script
// execution. Every such command is routed through the guards below first.
//
// This module deliberately uses NO external WebSocket and NO cross-origin
// messaging — the legacy Inspector Bridge tracking script (which opened a
// `wss://` connection to an external host and posted to window.parent) has been
// removed. Commands arrive only over the app's own Live Voice WebSocket and are
// validated here before any DOM side effect runs.

// A selector is only accepted when it is a short, plain CSS selector. We reject
// empty/oversized input and the universal/descendant patterns that can match
// the whole document and lock up the main thread.
export function isValidSelector(selector) {
  if (typeof selector !== 'string') return false;
  const trimmed = selector.trim();
  if (trimmed.length === 0 || trimmed.length > 200) return false;
  // Reject the catch-all "*" and any descendant combination that ends in "*"
  // (e.g. "body *"), which forces a full-document match.
  if (trimmed === '*' || /\*\s*$/.test(trimmed)) return false;
  // Disallow characters that have no place in a simple selector and are common
  // in injection attempts.
  if (/[<>{}();]/.test(trimmed)) return false;
  // Confirm the browser actually parses it as a selector before we use it.
  try {
    if (typeof document !== 'undefined' && typeof document.createDocumentFragment === 'function') {
      document.createDocumentFragment().querySelector(trimmed);
    }
    return true;
  } catch {
    return false;
  }
}

// A URL is only accepted when it parses and uses an http(s) scheme. This blocks
// `javascript:`, `data:`, `file:` and other schemes that the model should never
// be able to make the app navigate to.
export function isValidUrl(url) {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;
  try {
    const base = typeof window !== 'undefined' ? window.location?.href : undefined;
    const parsed = new URL(trimmed, base);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validate and dispatch a single AI-issued command. Returns true when the
// command was accepted and acted on, false when it was rejected by validation.
// `actions` lets callers (and tests) inject the click/navigate side effects.
export function handleCommand(msg, actions = {}) {
  if (!msg || typeof msg !== 'object') return false;
  switch (msg.command) {
    case 'click': {
      // sanitize: only act on a selector that passes isValidSelector.
      if (!isValidSelector(msg.selector)) {
        console.warn('Rejected AI click command with invalid selector:', msg.selector);
        return false;
      }
      actions.click?.(msg.selector);
      return true;
    }
    case 'navigate': {
      // sanitize: only navigate to a validated http(s) URL.
      if (!isValidUrl(msg.url)) {
        console.warn('Rejected AI navigate command with invalid url:', msg.url);
        return false;
      }
      actions.navigate?.(msg.url);
      return true;
    }
    default:
      return false;
  }
}

// Default DOM side effects for an AI command: click the matched element or
// navigate the window. Callers can override these (e.g. in tests).
export const defaultCommandActions = {
  click: (selector) => {
    const el = document.querySelector(selector);
    if (el && typeof el.click === 'function') el.click();
  },
  navigate: (url) => {
    window.location.assign(url);
  },
};

// InspectorBridge is a non-rendering React component: drop it in the tree and it
// guards/handles AI commands without owning any UI of its own. It renders
// nothing; the validated command handling lives in `handleCommand` above.
export default function InspectorBridge() {
  return null;
}
