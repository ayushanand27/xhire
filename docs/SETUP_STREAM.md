# Setup: Stream.io (Video & Chat)

This guide walks you through setting up Stream.io for video recording and real-time collaboration in proctored interviews.

## Why Stream.io?

- Pre-built video infrastructure
- Recording proctored interviews
- Real-time chat/messaging
- Screen sharing ready
- Scalable to millions of users
- Easy integration with existing xHire codebase

---

## Step 1: Create Stream.io Account

1. Go to https://getstream.io/
2. Click **"Get Started"** or **"Sign Up"**
3. Create account with:
   - Email
   - Password
   - Organization name
4. Verify email

---

## Step 2: Create Application

1. In Stream.io dashboard → **My Apps**
2. Click **"Create App"**
3. Configure:
   - **App Name**: `xhire`
   - **Type**: Select **Video**
   - **Environment**: Development (for testing), Production (for live)
4. Click **"Create"**

---

## Step 3: Get API Keys

1. In Stream.io dashboard → **Apps** → **Your app**
2. Copy:
   - **API Key** (under "Credentials")
   - **API Secret** (under "Credentials")

**Save both securely**

---

## Step 4: Add to Backend .env

In `backend/.env`:
```bash
STREAM_API_KEY=YOUR_API_KEY
STREAM_API_SECRET=YOUR_API_SECRET
```

Replace with your actual keys from Step 3.

---

## Step 5: Add to Frontend .env

In `frontend/.env.local`:
```bash
VITE_STREAM_API_KEY=YOUR_API_KEY
```

---

## How Stream.io Works with xHire

### Architecture

```
Proctored Interview Flow:
1. Recruiter creates proctored interview
   ↓
2. Candidate joins call
   ↓
3. Stream.io room created (WebRTC)
   ↓
4. Audio/video streams to Deepgram (STT)
   ↓
5. Candidate answers logged
   ↓
6. Video recording saved (optional)
   ↓
7. Face-api.js monitoring runs on browser
   ↓
8. Proctoring events sent to backend
```

### Key Flow
1. Backend generates Stream.io token for candidate
2. Frontend connects to Stream.io using token
3. WebRTC video stream established
4. Deepgram transcribes audio
5. Claude evaluates answers
6. Video/transcript stored in Supabase

---

## Step 6: Generate Stream Token (Backend)

In your backend, generate a token when starting interview:

```javascript
// backend/src/lib/stream.js
import StreamClient from '@stream-io/node-sdk';

const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export function generateStreamToken(userId, roomId) {
  const token = streamClient.generateUserToken({
    user_id: userId,
    validity_in_seconds: 3600 // 1 hour
  });
  
  return token;
}

export function createStreamRoom(roomId) {
  return streamClient.video.queryCalls({
    filter_conditions: { id: roomId }
  });
}
```

---

## Step 7: Frontend Integration

### Join Video Call

```javascript
// frontend/src/components/ProctorVideo.jsx
import { StreamVideo, StreamCall, ParticipantView } from '@stream-io/video-react-sdk';

export default function ProctorVideo({ roomId, userId, streamToken }) {
  return (
    <StreamVideo client={streamClient} apiKey={streamApiKey}>
      <StreamCall call={call}>
        <div className="video-grid">
          <ParticipantView />
          <ParticipantView />
        </div>
      </StreamCall>
    </StreamVideo>
  );
}
```

### Record Interview (Optional)

```javascript
// Start recording
async function startRecording(roomId) {
  const response = await fetch(`/api/stream/record/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomId })
  });
  
  return response.json();
}

// Stop recording
async function stopRecording(roomId) {
  const response = await fetch(`/api/stream/record/stop`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomId })
  });
  
  return response.json();
}
```

---

## Step 8: Backend Recording API (Optional)

```javascript
// backend/src/controllers/streamController.js
export async function startRecording(req, res) {
  try {
    const { roomId } = req.body;
    
    const call = await streamClient.video.queryCalls({
      filter_conditions: { id: roomId }
    });
    
    // Start recording
    await call.start_recording();
    
    res.json({ success: true, recordingStarted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function stopRecording(req, res) {
  try {
    const { roomId } = req.body;
    
    const call = await streamClient.video.queryCalls({
      filter_conditions: { id: roomId }
    });
    
    // Stop recording
    await call.stop_recording();
    
    res.json({ success: true, recordingStopped: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## Video Features

### 1. Real-Time Communication
- Audio/video streaming
- Screen sharing
- Chat messaging
- Low latency (<100ms)

### 2. Recording
- Automatic or manual recording
- Save to Stream storage (or custom)
- MP4 format downloadable

### 3. Participant Management
- Mute/unmute individual users
- Remove participants
- Kick users from call

### 4. Layout Options
- Speaker view
- Grid view
- Picture-in-picture
- Spotlight mode

---

## Testing

### Test Health Check
```bash
curl -X GET https://api.getstream.io/video/v1/calls/default/YOUR_ROOM_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test Token Generation
```bash
# In backend
npm run dev

# In another terminal
curl -X GET http://localhost:4000/api/stream/token/USER_ID/ROOM_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Expected response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "userId": "user123",
  "roomId": "room456"
}
```

---

## Pricing

| Usage | Cost |
|-------|------|
| P2P calls (< 2 participants) | Free |
| Group calls (3+ participants) | $0.01 - $0.05 per minute per user |
| Recording | $0.005 per minute |
| Overage | Included up to plan limit |

Rough estimate:
- 1 proctored interview (30 min) = ~$0.75 - $1.50 (with recording)
- 100 interviews = ~$75 - $150

---

## Security

- ✅ API Secret kept on backend only
- ✅ Tokens generated server-side with expiration
- ✅ HTTPS/WSS for all connections
- ✅ Firewall rules available
- ✅ GDPR compliant (data can be deleted)

---

## Troubleshooting

### Error: "Invalid API Key"
- Verify `STREAM_API_KEY` and `STREAM_API_SECRET` in `.env`
- Check keys are copied correctly (no extra spaces)
- Regenerate keys if needed in dashboard

### Video not connecting
- Check room ID is unique
- Verify token is not expired
- Check network connection
- Try in incognito/private mode

### No audio
- Verify microphone permissions granted
- Check audio input device
- Try another browser

### Recording not available
- Check recording is enabled in Stream dashboard
- Recording may not be available in free tier
- Upgrade plan if needed

### High latency
- Normal for Internet calls: 100-300ms
- Check network bandwidth
- Reduce video quality if needed

---

## Production Considerations

### Deployment
1. Create production app in Stream dashboard
2. Update `STREAM_API_KEY` and `STREAM_API_SECRET`
3. Set `STREAM_ENVIRONMENT` to "production"

### Recording Storage
1. Configure storage in Stream dashboard
2. AWS S3 recommended for large deployments
3. Set retention policies

### Compliance
1. Enable audit logs
2. Set data retention policies
3. Enable encryption at rest (if available)

---

## Advanced Features (Optional)

### Custom Layouts
```javascript
// Stream.io supports custom video layouts
// Configure in dashboard or via API
```

### Webhooks
```javascript
// Receive events when:
// - Call starts/ends
// - Recording completes
// - Participant joins/leaves
```

### Screen Sharing
```javascript
// Frontend: Built into StreamCall component
// Backend: No additional config needed
```

---

## Next: Setup Supabase Storage

Once Stream.io is working, follow [SETUP_SUPABASE_STORAGE.md](SETUP_SUPABASE_STORAGE.md)

---

## Stream.io Resources

- [Video Documentation](https://getstream.io/video/docs)
- [React SDK](https://getstream.io/video/docs/react)
- [Node.js SDK](https://getstream.io/video/docs/nodejs)
- [Dashboard](https://getstream.io/dashboard)
- [API Reference](https://getstream.io/video/docs/api)
- [Pricing](https://getstream.io/pricing)
