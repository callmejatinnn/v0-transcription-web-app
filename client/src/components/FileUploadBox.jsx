import React, { useRef } from 'react';

function FileUploadBox({ onFileSelect, selectedFile }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className="file-upload-box"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept="audio/*,video/*"
        style={{ display: 'none' }}
      />
      
      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <p className="upload-title">Upload Audio or Video Files</p>
        <p className="upload-formats">
          Supported: MP3, WAV, OGG, FLAC, M4A, MP4, AVI, MOV, MKV
        </p>
        
        {selectedFile ? (
          <div className="file-selected">
            <p className="selected-file-name">✓ {selectedFile.name}</p>
            <p className="selected-file-size">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button 
              className="change-file-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Change File
            </button>
          </div>
        ) : (
          <button 
            className="browse-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files or Drag & Drop
          </button>
        )}
      </div>
    </div>
  );
}

export default FileUploadBox;
