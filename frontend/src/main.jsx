import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { installGlobalErrorTracking } from './inspectorBridge.js'
import './index.css'

// Capture uncaught runtime errors and unhandled promise rejections from the
// earliest possible point so the error_rate metric reflects the whole session.
installGlobalErrorTracking()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
