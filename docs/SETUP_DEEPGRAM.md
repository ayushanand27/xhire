# Setup: Deepgram API (Speech-to-Text)

This guide walks you through setting up Deepgram for real-time speech-to-text transcription during interviews.

## Why Deepgram?

- WebSocket API for real-time transcription
- Runs in browser (low latency)
- Excellent accuracy for technical interviews
- Detects confidence scores per word
- Supports multiple languages
- Fast setup and excellent documentation

---

## Step 1: Create Deepgram Account

1. Go to https://console.deepgram.com/
2. Click **"Sign Up"** (or **"Sign In"** if you already have an account)
3. Create account with:
   - Email
   - Password
   - Organization name
4. Verify email

---

## Step 2: Get API Key

1. In Deepgram console → **API Keys** (left sidebar)
2. Click **"Create an API Key"**
3. Configure:
   - **Key Name**: `xhire-browser`
   - **Scopes**: Check `Transcription` only
   - **Can Read**: (leave default)
   - **Can Write**: (leave default)
4. Copy the API key (long alphanumeric string)
5. **Save it securely**

---

## Step 3: Setup Billing (Optional)

1. In Deepgram console → **Billing** (left sidebar)
2. Add payment method
3. Set spending alerts (recommended)

**Cost Structure**:
- Per audio minute transcribed
- Free tier: 600 minutes/month
- Paid: ~$0.0059 per minute

Rough calculation:
- 1 interview (15 min audio) = ~$0.09
- 100 interviews = ~$9

---

## Step 4: Add to Backend .env

In `backend/.env`:
```bash
DEEPGRAM_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

---

## Step 5: Add to Frontend .env

In `frontend/.env.local` (optional - for direct browser connection):
```bash
VITE_DEEPGRAM_API_KEY=YOUR_API_KEY_HERE
```

---

## How Deepgram Integration Works

### Backend Role
1. Provides WebSocket connection URL to frontend
2. Endpoint: `GET /api/jobs/deepgram/connection-url`
3. Returns signed WebSocket URL with credentials

### Frontend Role
1. Requests connection URL from backend
2. Opens WebSocket directly to Deepgram
3. Streams browser audio to Deepgram
4. Receives live transcription
5. Sends transcription to backend for evaluation

### Data Flow
```
Browser Microphone
    ↓ Audio Stream
Deepgram WebSocket (real-time)
    ↓ Transcription
Frontend Component
    ↓ Final Transcript
POST /api/interview/:id/answer
    ↓ Answer + Transcript
Backend Claude Evaluation
```

---

## Step 6: Test Connection (Backend)

```bash
# From backend directory
npm run dev
```

Test the connection URL endpoint:
```bash
curl -X GET http://localhost:4000/api/jobs/deepgram/connection-url \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "connectionUrl": "wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&model=nova-2&smart_format=true&...&authorization=..."
}
```

---

## WebSocket Parameters Explained

The connection URL includes these parameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `encoding` | `linear16` | Audio format (16-bit signed) |
| `sample_rate` | `16000` | Audio sample rate (16 kHz) |
| `model` | `nova-2` | Speech recognition model |
| `smart_format` | `true` | Auto-format punctuation |
| `interim_results` | `true` | Stream partial results |
| `utterance_end_ms` | `1000` | Silence detection (1 sec) |
| `language` | `en` | Language code |

---

## Browser Integration Example

```javascript
// Request connection URL from backend
const response = await fetch('/api/jobs/deepgram/connection-url', {
  headers: {
    'Authorization': `Bearer ${clerkToken}`
  }
});
const { connectionUrl } = await response.json();

// Open WebSocket
const ws = new WebSocket(connectionUrl);

// Handle transcription
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'Results') {
    const transcript = data.channel.alternatives[0].transcript;
    const confidence = data.channel.alternatives[0].confidence;
    
    console.log(`Transcript: ${transcript} (${confidence}%)`);
    
    // Send to backend when speech ends
    if (data.speech_final) {
      submitAnswer(transcript);
    }
  }
};

// Send audio
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (event) => {
      const audioData = event.inputBuffer.getChannelData(0);
      ws.send(audioData);
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
  });
```

---

## Deepgram Features

### 1. Real-time Transcription
- Streaming results as user speaks
- Interim results for live feedback
- Final results with confidence

### 2. Speaker Detection (Optional)
- Identifies different speakers
- Useful for multi-party interviews

### 3. Punctuation & Formatting
- Auto-adds periods, commas
- Fixes "ur" → "your"
- Capitalizes properly

### 4. Language Support
- English (default)
- Spanish, French, German, etc.
- Auto-detect available

### 5. Custom Dictionary
- Add technical terms
- Ensure accurate transcription
- (Available on paid plans)

---

## Supported Audio Formats

| Format | Encoding | Sample Rate | Status |
|--------|----------|-------------|--------|
| WAV | `linear16` | 8kHz - 48kHz | ✅ Recommended |
| Linear PCM | `linear16` | 8kHz - 48kHz | ✅ Recommended |
| Opus | `opus` | 8kHz - 48kHz | ✅ Supported |
| MP3 | `mp3` | 8kHz - 48kHz | ✅ Supported |
| AAC | `aac` | 8kHz - 48kHz | ✅ Supported |

For browser microphone: use `linear16` at `16000` sample rate.

---

## Troubleshooting

### Error: "Invalid API key"
- Verify `DEEPGRAM_API_KEY` is set in `.env`
- Check key hasn't been revoked in Deepgram console
- Generate new key if needed

### WebSocket connection fails
- Check browser supports WebSocket
- Verify CORS is not blocking connection
- Check firewall/proxy settings

### No audio streaming
- Verify microphone permissions granted
- Check audio context sample rate matches (16000)
- Ensure audio data is being sent to WebSocket

### Transcription is blank
- Verify audio levels are high enough
- Check microphone is working
- Try in quiet environment
- Check model supports language (default: English)

### High latency or stuttering
- Network delay is normal (1-3 seconds)
- Check network bandwidth (200 kbps minimum)
- Reduce audio sample rate (try 8000)

---

## Monitoring Usage

In Deepgram console:

1. Go to **Usage** (left sidebar)
2. View:
   - Transcription minutes used
   - Audio requests
   - Spend to date
   - Quota remaining

---

## Security Notes

- ✅ API key stored in `.env` only (backend)
- ✅ Frontend receives signed WebSocket URL (time-limited)
- ✅ Direct browser-to-Deepgram connection (no data relay)
- ✅ HTTPS/WSS only (encrypted)
- ✅ API key not exposed to client-side code

---

## Models Available

| Model | Quality | Speed | Cost | Best For |
|-------|---------|-------|------|----------|
| `nova-2` | Excellent | Fast | Standard | Default choice |
| `nova` | Good | Fast | Standard | Older fallback |
| `enhanced` | Very Good | Medium | Higher | Technical terms |

Default: `nova-2` (recommended for interviews)

---

## Next: Setup Clerk Authentication

Once Deepgram is working, follow [SETUP_CLERK.md](SETUP_CLERK.md)

---

## Deepgram Resources

- [API Documentation](https://developers.deepgram.com)
- [WebSocket Guide](https://developers.deepgram.com/docs/streaming)
- [Features](https://developers.deepgram.com/docs/features)
- [Console Dashboard](https://console.deepgram.com)
- [Pricing](https://deepgram.com/pricing)
