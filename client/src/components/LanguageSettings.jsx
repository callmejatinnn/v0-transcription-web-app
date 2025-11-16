import React from 'react';

function LanguageSettings({ 
  language, 
  setLanguage, 
  responseFormat, 
  setResponseFormat,
  subtitleSettings,
  setSubtitleSettings 
}) {
  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' }
  ];

  return (
    <div className="language-settings">
      <h3>Language & Settings</h3>
      
      <div className="setting-group">
        <label>Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label>Output Format</label>
        <select value={responseFormat} onChange={(e) => setResponseFormat(e.target.value)}>
          <option value="srt">SRT (Subtitles)</option>
          <option value="vtt">VTT (Web Video Text)</option>
          <option value="text">Text</option>
          <option value="verbose_json">Verbose JSON</option>
        </select>
      </div>

      <div className="subtitle-settings">
        <h4>Subtitle Settings</h4>
        
        <div className="setting-group">
          <label>
            Max Line Length: {subtitleSettings.maxLineLength}
          </label>
          <input 
            type="range" 
            min="20" 
            max="60" 
            value={subtitleSettings.maxLineLength}
            onChange={(e) => setSubtitleSettings({
              ...subtitleSettings,
              maxLineLength: parseInt(e.target.value)
            })}
          />
        </div>

        <div className="setting-group">
          <label>Max Lines</label>
          <select 
            value={subtitleSettings.maxLineCount}
            onChange={(e) => setSubtitleSettings({
              ...subtitleSettings,
              maxLineCount: parseInt(e.target.value)
            })}
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-group">
            <label>Min Duration (sec)</label>
            <input 
              type="number" 
              min="0" 
              max="4" 
              step="0.1"
              value={subtitleSettings.minDuration}
              onChange={(e) => setSubtitleSettings({
                ...subtitleSettings,
                minDuration: parseFloat(e.target.value)
              })}
            />
          </div>
          <div className="setting-group">
            <label>Max Duration (sec)</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.1"
              value={subtitleSettings.maxDuration}
              onChange={(e) => setSubtitleSettings({
                ...subtitleSettings,
                maxDuration: parseFloat(e.target.value)
              })}
            />
          </div>
        </div>
      </div>

      <div className="options-checkboxes">
        <h4>Options</h4>
        
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox"
              checked={subtitleSettings.diarization}
              onChange={(e) => setSubtitleSettings({
                ...subtitleSettings,
                diarization: e.target.checked
              })}
            />
            Enable Speaker Diarization
          </label>
        </div>

        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox"
              checked={subtitleSettings.includeSpeakerLabels}
              onChange={(e) => setSubtitleSettings({
                ...subtitleSettings,
                includeSpeakerLabels: e.target.checked
              })}
            />
            Include Speaker Labels
          </label>
        </div>

        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox"
              checked={subtitleSettings.timestamps}
              onChange={(e) => setSubtitleSettings({
                ...subtitleSettings,
                timestamps: e.target.checked
              })}
            />
            Use Character-level Timestamps
          </label>
        </div>
      </div>
    </div>
  );
}

export default LanguageSettings;
