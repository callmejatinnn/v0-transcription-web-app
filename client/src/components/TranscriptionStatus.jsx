import React, { useEffect, useRef } from 'react';

function TranscriptionStatus({ uploadProgress, isTranscribing, activityLog, error }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityLog]);

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
        </div>
      )}
    </div>
  );
}

export default TranscriptionStatus;
