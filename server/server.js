import express from "express"
import multer from "multer"
import cors from "cors"
import axios from "axios"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  const tempFilePath = req.file?.path

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" })
    }

    const userApiKey = req.headers["x-user-elevenlabs-key"]
    const apiKey = userApiKey || process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      cleanupFile(tempFilePath)
      return res.status(400).json({
        success: false,
        error: "No API key provided. Please set ELEVENLABS_API_KEY in server .env or provide your key in API Settings.",
      })
    }

    // Extract form fields
    const { language, response_format, diarization, min_duration, max_duration } = req.body

    const fileBuffer = fs.readFileSync(tempFilePath)
    const fileName = req.file.originalname

    const FormData = (await import("form-data")).default
    const form = new FormData()

    // Add file to form data
    form.append("file", fileBuffer, fileName)
    form.append("model_id", "scribe_v1")

    // Add optional parameters
    if (language && language !== "auto") {
      form.append("language_code", language)
    }
    if (diarization === "true") {
      form.append("diarize", "true")
    }
    form.append("tag_audio_events", "true")

    const elevenLabsResponse = await axios.post("https://api.elevenlabs.io/v1/speech-to-text", form, {
      headers: {
        "xi-api-key": apiKey,
        ...form.getHeaders(),
      },
      timeout: 300000, // 5 minutes for large files
    })

    // Clean up temp file
    cleanupFile(tempFilePath)

    let formattedData = elevenLabsResponse.data
    const minDuration = Number.parseFloat(min_duration) || 0.5
    const maxDuration = Number.parseFloat(max_duration) || 5

    // If response_format is requested as different format, convert appropriately
    if (response_format === "srt" || response_format === "vtt") {
      formattedData = convertToSubtitleFormat(elevenLabsResponse.data, response_format, minDuration, maxDuration)
    }

    // Return result
    res.json({
      success: true,
      data: formattedData,
      format: response_format || "json",
    })
  } catch (error) {
    // Clean up temp file on error
    cleanupFile(tempFilePath)

    console.error("Transcription error:", error.response?.status, error.response?.data || error.message)

    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data
      const errorMessage = errorData?.message || errorData?.error || "ElevenLabs API error"

      let userFriendlyMessage = errorMessage

      if (status === 429) {
        userFriendlyMessage =
          "Rate limited by ElevenLabs. You have exceeded your API quota. Check your usage at https://elevenlabs.io/app/billing/overview"
      } else if (status === 401) {
        userFriendlyMessage =
          "Invalid or expired ElevenLabs API key. Please verify your API key in API Settings or server .env file."
      } else if (status === 400) {
        userFriendlyMessage = `Invalid request: ${errorMessage}`
      }

      return res.status(status).json({
        success: false,
        error: userFriendlyMessage,
        details: process.env.NODE_ENV === "development" ? errorData : undefined,
      })
    }

    res.status(500).json({
      success: false,
      error: error.message || "Transcription failed",
    })
  }
})

function convertToSubtitleFormat(data, format, minDuration = 0.5, maxDuration = 5) {
  const transcript = data.text || data.transcript || ""
  const chunks = data.chunks || []

  if (chunks.length === 0) {
    // If no chunks with timing info, return raw transcript
    return {
      text: transcript,
      chunks: [],
    }
  }

  // Process chunks to respect min/max duration
  const processedChunks = processChunksWithDuration(chunks, minDuration, maxDuration)

  if (format === "srt") {
    const srtContent = processedChunks
      .map((chunk) => {
        return `${chunk.index}\n` + `${chunk.startTime} --> ${chunk.endTime}\n` + `${chunk.content}\n`
      })
      .join("\n")

    return srtContent
  } else if (format === "vtt") {
    const vttContent =
      "WEBVTT\n\n" +
      processedChunks
        .map((chunk) => {
          return `${chunk.startTime} --> ${chunk.endTime}\n${chunk.content}\n`
        })
        .join("\n")

    return vttContent
  }

  return data
}

function processChunksWithDuration(chunks, minDuration, maxDuration) {
  const processed = []
  let mergedChunk = null

  chunks.forEach((chunk) => {
    const startTime = chunk.begin_time_ms
    const endTime = chunk.end_time_ms
    const duration = (endTime - startTime) / 1000 // Convert to seconds

    if (mergedChunk === null) {
      mergedChunk = {
        begin_time_ms: startTime,
        end_time_ms: endTime,
        content: chunk.content,
      }
    } else {
      const mergedDuration = (mergedChunk.end_time_ms - mergedChunk.begin_time_ms) / 1000

      // If adding this chunk would exceed maxDuration, finalize the merged chunk
      if (mergedDuration + duration > maxDuration) {
        // Only add if it meets minimum duration
        if (mergedDuration >= minDuration) {
          processed.push({
            index: processed.length + 1,
            startTime: formatTimestamp(mergedChunk.begin_time_ms, "srt"),
            endTime: formatTimestamp(mergedChunk.end_time_ms, "srt"),
            content: mergedChunk.content.trim(),
          })
        }
        // Start new chunk
        mergedChunk = {
          begin_time_ms: startTime,
          end_time_ms: endTime,
          content: chunk.content,
        }
      } else {
        // Merge chunks
        mergedChunk.end_time_ms = endTime
        mergedChunk.content += " " + chunk.content
      }
    }
  })

  // Add final chunk if it meets minimum duration
  if (mergedChunk && (mergedChunk.end_time_ms - mergedChunk.begin_time_ms) / 1000 >= minDuration) {
    processed.push({
      index: processed.length + 1,
      startTime: formatTimestamp(mergedChunk.begin_time_ms, "srt"),
      endTime: formatTimestamp(mergedChunk.end_time_ms, "srt"),
      content: mergedChunk.content.trim(),
    })
  }

  return processed
}

function formatTimestamp(milliseconds, format) {
  if (!milliseconds && milliseconds !== 0) return "00:00:00,000"

  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const ms = milliseconds % 1000

  const pad = (num) => String(num).padStart(2, "0")
  const separator = format === "srt" ? "," : "."

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${String(ms).padStart(3, "0")}`
}

// Utility function to clean up temp files
function cleanupFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err)
    })
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    success: false,
    error: "Server error: " + err.message,
  })
})

app.listen(PORT, () => {
  console.log(`Transcription server running on http://localhost:${PORT}`)
})
