// Purpose: thin entry orchestrator for the Lebanese-dialect learning SPA. The
// real application now lives in src/components/App.jsx, which composes the
// ExecutionFlow + LiveChat providers (src/contexts/) and mounts the
// InspectorBridge AI-command guard (src/components/InspectorBridge.jsx). This
// file is kept as a one-line re-export so the historical `src/App.jsx` import
// path keeps working after the components/ restructure.
//
// Upstream (what this file depends on): src/components/App.jsx (the real root
// component) and, transitively, src/contexts/, src/hooks/ and src/utils/.
// Downstream (what depends on this file): legacy imports of `./App`; the live
// entry path is src/main.jsx -> src/components/App.jsx.
export { default } from './components/App.jsx';
