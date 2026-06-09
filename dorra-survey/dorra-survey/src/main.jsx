import React from 'react'
import ReactDOM from 'react-dom/client'
import DorraSurvey from './DorraSurvey'

// Storage shim for browser (replaces Claude artifact storage)
window.storage = {
  _data: {},
  get: async (key) => {
    try {
      const val = localStorage.getItem(key)
      return val ? { key, value: val } : null
    } catch { return null }
  },
  set: async (key, value) => {
    try {
      localStorage.setItem(key, value)
      return { key, value }
    } catch { return null }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DorraSurvey />
  </React.StrictMode>
)
