import React, { useState, useCallback } from 'react';
import './App.css';
import FileUploadBox from './components/FileUploadBox';
import LanguageSettings from './components/LanguageSettings';
import TranscriptionStatus from './components/TranscriptionStatus';
import ResultDisplay from './components/ResultDisplay';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [responseFormat, setResponseFormat] = useState('srt');
  const [subtitleSettings, setSubtitleSettings] = useState({
    maxLineLength: 42,
    maxLineCount: 1,
    minDuration: 0.8,
    maxDuration: 1.5,
    diarization: false,
    includeSpeakerLabels: false,
    timestamps: false
  });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activityLog, setActivityLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showApiModal, setShowApiModal] = useState(false);

  const addActivityLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [...prev, { timestamp, message }]);
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setActivityLog([]);
    addActivityLog(`File selected: ${file.name}`);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsTranscribing(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);
    setActivityLog([]);
    addActivityLog('Starting transcription...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', language);
      formData.append('response_format', responseFormat);
      formData.append('max_line_length', subtitleSettings.maxLineLength);
      formData.append('max_line_count', subtitleSettings.maxLineCount);
      formData.append('min_duration', subtitleSettings.minDuration);
      formData.append('max_duration', subtitleSettings.maxDuration);
      formData.append('diarization', subtitleSettings.diarization);
      formData.append('include_speaker_labels', subtitleSettings.includeSpeakerLabels);
      formData.append('timestamps', subtitleSettings.timestamps);

      addActivityLog('Uploading file...');

      // Get user API key if available
      const userApiKey = localStorage.getItem('openai_api_key');
      const headers = {};
      if (userApiKey) {
        headers['x-user-openai-key'] = userApiKey;
        addActivityLog('Using your API key');
      } else {
        addActivityLog('Using server API key');
      }

      // Create XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
          addActivityLog(`Uploading: ${percentComplete.toFixed(1)}%`);
        }
      });

      // Make request
      const response = await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Server error: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.open('POST', 'http://localhost:4000/api/transcribe');
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      addActivityLog('Transcription completed!');
      setResult({
        data: response.data,
        format: responseFormat
      });

    } catch (err) {
      const errorMessage = err.message || 'Transcription failed';
      addActivityLog(`Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TRB's Subtitle Studio</h1>
        <button 
          className="api-settings-btn" 
          onClick={() => setShowApiModal(true)}
          title="Configure your OpenAI API key"
        >
          ⚙️ API Settings
        </button>
      </header>

      <main className="app-main">
        <div className="upload-column">
          <FileUploadBox 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
          
          <LanguageSettings
            language={language}
            setLanguage={setLanguage}
            responseFormat={responseFormat}
            setResponseFormat={setResponseFormat}
            subtitleSettings={subtitleSettings}
            setSubtitleSettings={setSubtitleSettings}
          />

          <button 
            className="start-button"
            onClick={handleTranscribe}
            disabled={!selectedFile || isTranscribing}
          >
            {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
          </button>
        </div>

        <div className="right-column">
          <TranscriptionStatus
            uploadProgress={uploadProgress}
            isTranscribing={isTranscribing}
            activityLog={activityLog}
            error={error}
          />
        </div>
      </main>

      {result && (
        <ResultDisplay 
          result={result}
          onClose={() => setResult(null)}
        />
      )}

      <ApiKeyModal 
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
      />
    </div>
  );
}

export default App;
