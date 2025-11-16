# TRB's Subtitle Studio - Transcription Web App

A full-stack transcription web app using OpenAI's Whisper API for audio and video file transcription. Features a modern React frontend and Node.js/Express backend with support for multiple output formats and advanced transcription settings.

## Features

- **Drag & Drop Upload** - Easy file selection for audio and video files
- **Multiple Formats** - Support for MP3, WAV, OGG, FLAC, M4A, MP4, AVI, MOV, MKV
- **Output Formats** - SRT, VTT, Text, and Verbose JSON
- **Language Support** - Auto-detection or selection from 25+ languages
- **Subtitle Customization** - Control line length, duration, and other subtitle parameters
- **API Key Management** - Use your own OpenAI API key or server key
- **Real-time Progress** - Activity log with upload and processing updates
- **Download Results** - Save transcriptions in your preferred format

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd transcribe-app
\`\`\`

### 2. Set Up the Backend

\`\`\`bash
cd server
npm install
\`\`\`

Create a `.env` file in the `server` directory:

\`\`\`
PORT=4000
OPENAI_API_KEY=sk-your-api-key-here
\`\`\`

### 3. Set Up the Frontend

\`\`\`bash
cd ../client
npm install
\`\`\`

### 4. Run the Application

**Terminal 1 - Start the Backend:**

\`\`\`bash
cd server
npm start
\`\`\`

The server will run on `http://localhost:4000`

**Terminal 2 - Start the Frontend:**

\`\`\`bash
cd client
npm start
\`\`\`

The client will open at `http://localhost:3000`

## Usage

1. **Upload a File** - Drag and drop or browse to select an audio/video file
2. **Configure Settings** (Optional)
   - Choose a language (auto-detect by default)
   - Select output format (SRT recommended for subtitles)
   - Adjust subtitle settings (line length, duration, etc.)
3. **API Key** (Optional)
   - Click "API Settings" to use your own OpenAI API key
   - Or use the server's default key from `.env`
4. **Start Transcription** - Click the button and monitor progress
5. **Download Result** - Once complete, download your transcription

## API Endpoints

### POST /api/transcribe

Transcribe an audio/video file.

**Request:**
- `Content-Type`: multipart/form-data
- Headers: `x-user-openai-key` (optional - user's OpenAI API key)

**Form Fields:**
- `file` (binary) - Audio or video file
- `language` (string) - Language code or "auto"
- `response_format` (string) - "srt", "vtt", "text", or "verbose_json"
- `max_line_length` (number) - Maximum subtitle line length (20-60)
- `max_line_count` (number) - Maximum lines per subtitle (1-4)
- `min_duration` (number) - Minimum subtitle duration in seconds
- `max_duration` (number) - Maximum subtitle duration in seconds
- `diarization` (boolean) - Enable speaker diarization
- `include_speaker_labels` (boolean) - Include speaker labels
- `timestamps` (boolean) - Use character-level timestamps

**Response:**
\`\`\`json
{
  "success": true,
  "data": "...",
  "format": "srt"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "Error message"
}
\`\`\`

## Security Notes

⚠️ **Important Security Information:**

- **API Keys in localStorage** - User API keys are stored only in browser localStorage
- **Never use on public computers** - Clear your API key after use
- **Keys never sent to server** - User keys are only sent as request headers, never persisted
- **Server doesn't log keys** - API keys are not logged or stored on the backend
- **Use HTTPS in production** - Always use HTTPS when deploying to production
- **Monitor your API usage** - OpenAI will bill based on transcription usage

### To Clear Your API Key

1. Click "API Settings" in the top right
2. Click "Clear Saved Key"
3. Confirm

## Deployment

### Deploy Backend (Node.js + Express)

**Option 1: Render.com**
1. Push your repository to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables: `OPENAI_API_KEY`
5. Deploy

**Option 2: Railway.app**
1. Push your repository to GitHub
2. Create new project on Railway
3. Connect GitHub repo
4. Set environment variables
5. Deploy

**Option 3: Vercel (Serverless)**
1. Note: Express requires serverless configuration
2. Consider using Render or Railway for simpler deployment

### Deploy Frontend (React)

**Option 1: Vercel**
\`\`\`bash
npm run build
# Install Vercel CLI: npm i -g vercel
vercel
\`\`\`

**Option 2: Netlify**
\`\`\`bash
npm run build
# Drag and drop the 'build' folder to Netlify
\`\`\`

**Option 3: GitHub Pages**
\`\`\`bash
npm run build
# Configure repository settings for GitHub Pages
\`\`\`

### Environment Variables for Production

After deployment, set these environment variables:

**Backend:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 4000)

**Frontend:**
- Update the API endpoint in `App.jsx` from `http://localhost:4000` to your deployed backend URL

## Troubleshooting

### Backend fails to start
- Check that port 4000 is not in use: `lsof -i :4000` (Mac/Linux)
- Ensure `.env` file is in the `server` directory
- Verify OpenAI API key is valid

### Transcription errors
- Check your OpenAI API key balance and limits
- Verify the audio file is in a supported format
- Check the Activity Log for specific error messages
- Ensure backend is running and accessible

### Frontend can't connect to backend
- Verify backend is running on port 4000
- Check browser console for CORS errors
- In production, update the API URL in `App.jsx`

### Rate limiting
- OpenAI may rate limit requests. Implement rate limiting on the backend:

\`\`\`javascript
// Example: Add npm package `express-rate-limit`
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.post('/api/transcribe', limiter, upload.single('file'), async (req, res) => {
  // ... existing code
});
\`\`\`

## File Structure

\`\`\`
transcribe-app/
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   └── components/
│   │       ├── FileUploadBox.jsx
│   │       ├── LanguageSettings.jsx
│   │       ├── TranscriptionStatus.jsx
│   │       ├── ResultDisplay.jsx
│   │       └── ApiKeyModal.jsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .gitignore
└── README.md
\`\`\`

## Technologies Used

### Backend
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Axios** - HTTP client
- **form-data** - Multipart form data handling

### Frontend
- **React** - UI framework
- **CSS3** - Styling
- **XMLHttpRequest** - Upload with progress tracking

### API
- **OpenAI Whisper API** - Audio transcription

## License

MIT

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review OpenAI documentation: https://platform.openai.com/docs/guides/speech-to-text
3. Open an issue on GitHub

## Tips & Best Practices

1. **Test with small files first** - Start with short audio clips to verify setup
2. **Monitor costs** - Transcription uses OpenAI credits ($0.36 per minute of audio)
3. **Use appropriate settings** - Adjust subtitle settings based on content type
4. **Save your results** - Download transcriptions immediately after completion
5. **Keep API key secure** - Use strong key and rotate regularly
