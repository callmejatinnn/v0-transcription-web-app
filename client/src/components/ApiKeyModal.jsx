import React, { useState, useEffect } from 'react';

function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setHasSavedKey(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setHasSavedKey(true);
      setApiKey('');
      setShowKey(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setHasSavedKey(false);
    setApiKey('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>API Settings</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Enter your OpenAI API key to use your own quota for transcriptions.
          </p>

          <div className="api-key-input-group">
            <label>OpenAI API Key</label>
            <div className="input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="api-key-input"
              />
              <button 
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {hasSavedKey && (
            <div className="saved-key-indicator">
              <p>✓ API key saved locally</p>
            </div>
          )}

          <div className="security-notes">
            <h4>Security Notes</h4>
            <ul>
              <li>Key stored in localStorage only. Do not use on public/shared computers.</li>
              <li>This app will send the key only for current transcription requests.</li>
              <li>Keys are never saved on the server.</li>
              <li>Clear your key after use, especially on shared devices.</li>
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
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;
