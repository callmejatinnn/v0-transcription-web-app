import express from 'express';
import multer from 'multer';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Main transcription endpoint
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  const tempFilePath = req.file?.path;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Get API key from header or environment
    const userApiKey = req.headers['x-user-openai-key'];
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      cleanupFile(tempFilePath);
      return res.status(400).json({
        success: false,
        error: 'No API key provided. Please set OPENAI_API_KEY in server .env or provide your key in API Settings.'
      });
    }

    // Extract form fields
    const { language, response_format, max_line_length, max_line_count, min_duration, max_duration, diarization, include_speaker_labels, timestamps } = req.body;

    // Build form data for OpenAI
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));
    formData.append('model', 'whisper-1');
    
    if (language && language !== 'auto') {
      formData.append('language', language);
    }
    if (response_format) {
      formData.append('response_format', response_format);
    }

    // OpenAI subtitle settings (if supported)
    if (max_line_length) {
      formData.append('max_line_width', parseInt(max_line_length));
    }
    if (max_line_count) {
      formData.append('max_line_count', parseInt(max_line_count));
    }
    if (min_duration) {
      formData.append('min_duration', parseFloat(min_duration));
    }
    if (max_duration) {
      formData.append('max_duration', parseFloat(max_duration));
    }

    // Note: diarization, speaker labels, and timestamps are experimental OpenAI features
    // We include them as optional fields
    if (diarization === 'true') {
      formData.append('diarization', 'true');
    }
    if (include_speaker_labels === 'true') {
      formData.append('include_speaker_labels', 'true');
    }
    if (timestamps === 'true') {
      formData.append('timestamp_granularities', 'segment');
    }

    // Call OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 300000 // 5 minutes for large files
      }
    );

    // Clean up temp file
    cleanupFile(tempFilePath);

    // Return result
    res.json({
      success: true,
      data: openaiResponse.data,
      format: response_format || 'json'
    });

  } catch (error) {
    // Clean up temp file on error
    cleanupFile(tempFilePath);

    console.error('Transcription error:', error.response?.status, error.response?.data || error.message);

    // Handle OpenAI errors
    if (error.response) {
      const errorMessage = error.response.data?.error?.message || 'OpenAI API error';
      return res.status(error.response.status).json({
        success: false,
        error: `OpenAI Error: ${errorMessage}`
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Transcription failed'
    });
  }
});

// Utility function to clean up temp files
function cleanupFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Server error: ' + err.message
  });
});

app.listen(PORT, () => {
  console.log(`Transcription server running on http://localhost:${PORT}`);
});
