import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { installGlobalErrorTracking } from './inspectorBridge.js'
import { installSingleMedia } from './utils/singleMedia.js'
import './index.css'

// Capture uncaught runtime errors and unhandled promise rejections from the
// earliest possible point so the error_rate metric reflects the whole session.
installGlobalErrorTracking()
// Only one audio/video plays at a time anywhere in the app.
installSingleMedia()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
