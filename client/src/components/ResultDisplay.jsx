import React from 'react';

function ResultDisplay({ result, onClose }) {
  const downloadResult = () => {
    const { data, format } = result;
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (format === 'verbose_json') {
      content = JSON.stringify(data, null, 2);
      filename = 'transcription.json';
      mimeType = 'application/json';
    } else if (format === 'srt') {
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      filename = 'transcription.srt';
      mimeType = 'text/plain';
    } else if (format === 'vtt') {
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      filename = 'transcription.vtt';
      mimeType = 'text/plain';
    } else {
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      filename = 'transcription.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const renderContent = () => {
    const { data, format } = result;

    if (format === 'verbose_json') {
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
    } else if (typeof data === 'string') {
      return <pre>{data}</pre>;
    } else {
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div className="result-overlay" onClick={onClose}>
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        <div className="result-header">
          <h2>Transcription Result</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="result-content">
          {renderContent()}
        </div>

        <div className="result-footer">
          <button className="download-btn" onClick={downloadResult}>
            ⬇️ Download Result
          </button>
          <button className="close-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ResultDisplay;
