// Backward-compatible re-export shim.
//
// The canonical prompt definitions now live in backend/models/prompts.js as
// part of the layered-architecture restructure (static domain data belongs in
// models/). Service-layer code historically imported these from
// services/prompts.js, so this module re-exports them to keep those imports
// working without touching every call site.
//
// Named symbols (LEBANESE_CORRECTION_PROMPT, ANALYSIS_SYSTEM_PROMPT,
// defaultLivePrompts) are forwarded verbatim from ../models/prompts.js.
export {
  LEBANESE_CORRECTION_PROMPT,
  ANALYSIS_SYSTEM_PROMPT,
  defaultLivePrompts,
} from '../models/prompts.js';
