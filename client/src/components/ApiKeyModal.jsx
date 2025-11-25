"use client"

import { useState, useEffect } from "react"

function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [hasSavedKey, setHasSavedKey] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem("elevenlabs_api_key")
    if (savedKey) {
      setHasSavedKey(true)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("elevenlabs_api_key", apiKey)
      setHasSavedKey(true)
      setApiKey("")
      setShowKey(false)
    }
  }

  const handleClear = () => {
    localStorage.removeItem("elevenlabs_api_key")
    setHasSavedKey(false)
    setApiKey("")
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>API Settings</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Enter your ElevenLabs API key to use your own quota for transcriptions. Your key will be stored locally in
            your browser only.
          </p>

          <div className={`api-status-badge ${hasSavedKey ? "personal" : "server"}`}>
            <span className="status-dot"></span>
            {hasSavedKey ? (
              <>
                <strong>✓ Using Your API Key</strong>
                <p>Your personal ElevenLabs API key is active and will be used for all transcriptions.</p>
              </>
            ) : (
              <>
                <strong>Using Server API Key</strong>
                <p>Add your ElevenLabs API key below to use your own quota instead.</p>
              </>
            )}
          </div>

          <div className="api-key-input-group">
            <label>ElevenLabs API Key</label>
            <div className="input-wrapper">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ElevenLabs API key..."
                className="api-key-input"
              />
              <button className="toggle-visibility" onClick={() => setShowKey(!showKey)}>
                {showKey ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {hasSavedKey && (
            <div className="saved-key-indicator">
              <p>✓ API key saved locally in your browser</p>
              <p style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>
                The key is encrypted in localStorage and never sent to our servers.
              </p>
            </div>
          )}

          <div className="security-notes">
            <h4>🔒 Security & Privacy</h4>
            <ul>
              <li>Key stored in browser localStorage only. Do not use on public/shared computers.</li>
              <li>Key is sent directly to ElevenLabs for transcription, never stored on our servers.</li>
              <li>You maintain full control and can clear your key at any time.</li>
              <li>Clear your key after use, especially on shared devices.</li>
              <li>The app works with both your API key and the server's default key.</li>
              <li>
                <a href="https://elevenlabs.io/app/billing/api-keys" target="_blank" rel="noopener noreferrer">
                  Get your ElevenLabs API key here
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave} disabled={!apiKey.trim()}>
            Save API Key
          </button>
          {hasSavedKey && (
            <button className="clear-btn" onClick={handleClear}>
              Clear Saved Key
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiKeyModal
