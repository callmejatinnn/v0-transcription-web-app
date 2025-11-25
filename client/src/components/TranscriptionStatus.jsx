import React, { useEffect, useRef } from 'react';

function TranscriptionStatus({ uploadProgress, isTranscribing, activityLog, error }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityLog]);

  const getErrorSuggestion = (errorMsg) => {
    if (errorMsg?.includes('Rate limited')) {
      return {
        suggestion: 'Check your API quota and try again in a few moments',
        link: 'https://platform.openai.com/account/usage',
        linkText: 'View API Usage'
      };
    }
    if (errorMsg?.includes('Invalid or expired API key')) {
      return {
        suggestion: 'Verify your API key is correct and active',
        link: 'https://platform.openai.com/api-keys',
        linkText: 'Manage API Keys'
      };
    }
    return null;
  };

  const errorSuggestion = getErrorSuggestion(error);

  return (
    <div className="transcription-status">
      <div className="status-header">
        <h3>Transcription Status</h3>
        {isTranscribing && <span className="spinner"></span>}
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        <p className="progress-text">{uploadProgress.toFixed(0)}%</p>
      </div>

      <div className="activity-log-container">
        <h4>Activity Log</h4>
        <div className="activity-log">
          {activityLog.length === 0 ? (
            <p className="empty-log">Waiting for action...</p>
          ) : (
            activityLog.map((log, idx) => (
              <div key={idx} className="activity-entry">
                <span className="log-time">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {error && (
        <div className="error-box">
          <p className="error-title">Error</p>
          <p className="error-message">{error}</p>
          {errorSuggestion && (
            <div className="error-suggestion">
              <p className="suggestion-text">{errorSuggestion.suggestion}</p>
              <a href={errorSuggestion.link} target="_blank" rel="noopener noreferrer" className="suggestion-link">
                {errorSuggestion.linkText} →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TranscriptionStatus;
