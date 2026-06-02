// Purpose: React error boundary for the SPA. It catches runtime errors thrown
// while rendering the component tree (which the global window 'error' listener
// cannot intercept, because React swallows render errors) and routes them to the
// Inspector Bridge error tracker so they count toward the measurable error_rate.
// It then shows a minimal fallback instead of an unmounted white screen.
//
// Upstream (what this depends on): ../inspectorBridge.js reportError sink.
// Downstream (what depends on this): src/main.jsx wraps <App/> with it so the
// whole tree is protected.
import React from 'react';
import { reportError } from '../inspectorBridge.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Count the render-time error toward error_rate via the shared sink.
    reportError(error, { source: 'runtime' });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
          مشکلی پیش آمد. لطفاً صفحه را تازه‌سازی کنید.
        </div>
      );
    }
    return this.props.children;
  }
}
