# xHire Frontend + Backend Integration Guide

This guide covers the complete integration of the new Prisma-based backend with the React frontend.

## Architecture

```
Frontend (React)
    ↓
API Clients (axios)
    ↓
Express API Routes (/api/interview, /api/user/v2)
    ↓
Prisma Controllers
    ↓
PostgreSQL / Supabase
    ↓
External APIs (Claude, Deepgram, Stream.io)
```

## Frontend API Clients

### Interview API (V2)

```javascript
import interviewApiV2 from '@/api/interviewsV2';

// 1. Create interview session
const { sessionId, resumeId, jdId } = await interviewApiV2.createInterview({
  type: 'MOCK', // or 'PROCTORED'
  resumeText: userResume,
  jdText: jobDescription,
});

// 2. Start interview (get first questions)
const { questions } = await interviewApiV2.startInterview(sessionId);

// 3. Submit answer
const { evaluation, nextQuestion } = await interviewApiV2.submitAnswer(sessionId, {
  question: 'What is your experience with Node.js?',
  answer: 'I have 5 years of experience with Node.js...',
});

// 4. Log proctoring events (if proctored)
await interviewApiV2.logProctorEvent(sessionId, {
  eventType: 'no_face_detected',
  severity: 'WARNING',
});
// Auto-rejects on 3 warnings

// 5. Complete interview
const { evaluationJobId } = await interviewApiV2.completeInterview(sessionId);

// 6. Poll for evaluation completion
let evaluation = null;
while (!evaluation) {
  const job = await interviewApiV2.getJobStatus(evaluationJobId);
  if (job.status === 'COMPLETED') {
    evaluation = job.result;
    break;
  }
  await new Promise(r => setTimeout(r, 2000)); // Wait 2s between polls
}
```

### User API (V2)

```javascript
import userApiV2 from '@/api/usersV2';

// Get current user
const user = await userApiV2.getMe();
// Returns: { id, email, name, role, resumes, jobDescriptions, candidateSessions, recruiterSessions }

// Update profile
await userApiV2.updateMe({
  name: 'John Doe',
  role: 'CANDIDATE',
  skills: ['Node.js', 'React', 'PostgreSQL'],
  yearsOfExperience: 5,
});

// Get candidate directory (recruiter only)
const candidates = await userApiV2.getDirectory();
// Returns: Array of candidates with latest evaluation scores

// Recruiter dashboard
const dashboard = await userApiV2.recruiterDashboard();
// Returns: {
//   stats: {
//     totalSessions,
//     completedSessions,
//     activeSessions,
//     terminatedSessions,
//     averageScores: { technical, communication }
//   },
//   recentSessions: [...]
// }
```

## Component Integration Examples

### 1. Interview Setup Component

```javascript
import { useState } from 'react';
import interviewApiV2 from '@/api/interviewsV2';

export function MockInterviewSetup() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const handleCreateInterview = async () => {
    try {
      setLoading(true);
      const result = await interviewApiV2.createInterview({
        type: 'MOCK',
        resumeText,
        jdText,
      });
      setSessionId(result.sessionId);
      // Navigate to interview page
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Paste your resume"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <textarea
        placeholder="Paste job description"
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />
      <button
        onClick={handleCreateInterview}
        disabled={loading || !resumeText || !jdText}
      >
        {loading ? 'Creating...' : 'Create Interview'}
      </button>
    </div>
  );
}
```

### 2. Live Interview Component

```javascript
import { useState, useEffect } from 'react';
import interviewApiV2 from '@/api/interviewsV2';

export function LiveInterview({ sessionId }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Start interview on mount
  useEffect(() => {
    const startInterview = async () => {
      try {
        const result = await interviewApiV2.startInterview(sessionId);
        setQuestions(result.questions);
      } catch (error) {
        console.error('Failed to start interview:', error);
      }
    };
    startInterview();
  }, [sessionId]);

  const handleSubmitAnswer = async () => {
    try {
      setLoading(true);
      const result = await interviewApiV2.submitAnswer(sessionId, {
        question: questions[currentQuestion],
        answer,
      });
      setEvaluation(result.evaluation);
      setNextQuestion(result.nextQuestion);
      setAnswer('');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setEvaluation(null);
      setNextQuestion(null);
    } else {
      // All questions answered, complete interview
      completeInterview();
    }
  };

  const completeInterview = async () => {
    const result = await interviewApiV2.completeInterview(sessionId);
    console.log('Evaluation job ID:', result.evaluationJobId);
    // Poll for evaluation result
  };

  return (
    <div>
      <h2>Question {currentQuestion + 1}/{questions.length}</h2>
      <p>{questions[currentQuestion]}</p>

      {!evaluation ? (
        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={loading || !answer}
          >
            {loading ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>
      ) : (
        <div>
          <h3>Evaluation</h3>
          <p>Technical Accuracy: {evaluation.technical_accuracy}/10</p>
          <p>Clarity: {evaluation.clarity}/10</p>
          <p>Feedback: {evaluation.feedback}</p>
          <p>Follow-up: {evaluation.follow_up}</p>
          <button onClick={handleContinue}>
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Interview'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 3. Proctoring Component (with face-api.js)

```javascript
import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import interviewApiV2 from '@/api/interviewsV2';

export function ProctorMonitor({ sessionId }) {
  const videoRef = useRef(null);
  const [warnings, setWarnings] = useState(0);
  const [terminated, setTerminated] = useState(false);

  useEffect(() => {
    const initProctoring = async () => {
      // Load face-api models
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmarkNet.loadFromUri(MODEL_URL);

      // Start video stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;

      // Monitor for violations
      const detectionInterval = setInterval(async () => {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetector())
          .withFaceLandmarks();

        if (!detections) {
          // No face detected
          await interviewApiV2.logProctorEvent(sessionId, {
            eventType: 'no_face_detected',
            severity: 'WARNING',
          });
        } else if (detections.landmarks.getJawOutline()[8].y < 50) {
          // Face too high (gaze off-screen)
          await interviewApiV2.logProctorEvent(sessionId, {
            eventType: 'gaze_off_screen',
            severity: 'WARNING',
          });
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(detectionInterval);
    };

    initProctoring();
  }, [sessionId]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: '100%', maxHeight: '300px' }}
      />
      <p>Warnings: {warnings}/3</p>
      {terminated && <p style={{ color: 'red' }}>Interview Terminated</p>}
    </div>
  );
}
```

### 4. Deepgram STT Component

```javascript
import { useEffect, useState } from 'react';
import interviewApiV2 from '@/api/interviewsV2';

export function AudioTranscriber({ onTranscript }) {
  const wsRef = useRef(null);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const initDeepgram = async () => {
      // Get Deepgram connection URL
      const { url } = await interviewApiV2.getDeepgramConnectionUrl();

      // Connect WebSocket
      const ws = new WebSocket(url);

      ws.onopen = async () => {
        // Start audio capture
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
          const audioData = event.inputBuffer.getChannelData(0);
          ws.send(audioData.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.channel?.alternatives?.[0]?.transcript) {
          const text = data.channel.alternatives[0].transcript;
          setTranscript(text);
          onTranscript(text);
        }
      };

      wsRef.current = ws;
    };

    initDeepgram();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onTranscript]);

  return <div>Transcript: {transcript}</div>;
}
```

### 5. Recruiter Dashboard Component

```javascript
import { useEffect, useState } from 'react';
import userApiV2 from '@/api/usersV2';

export function RecruiterDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await userApiV2.recruiterDashboard();
        setDashboard(data);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!dashboard) return <div>Failed to load dashboard</div>;

  return (
    <div>
      <h1>Recruiter Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
        <StatCard
          title="Total Interviews"
          value={dashboard.stats.totalSessions}
        />
        <StatCard
          title="Completed"
          value={dashboard.stats.completedSessions}
        />
        <StatCard
          title="Active"
          value={dashboard.stats.activeSessions}
        />
        <StatCard
          title="Avg Technical Score"
          value={`${dashboard.stats.averageScores.technical}/100`}
        />
      </div>

      <h2>Recent Interviews</h2>
      <table>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Type</th>
            <th>Status</th>
            <th>Technical Score</th>
            <th>Communication Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {dashboard.recentSessions.map((session) => (
            <tr key={session.id}>
              <td>{session.candidate?.name}</td>
              <td>{session.type}</td>
              <td>{session.status}</td>
              <td>{session.evaluation?.technicalScore || 'N/A'}</td>
              <td>{session.evaluation?.communicationScore || 'N/A'}</td>
              <td>{new Date(session.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>{title}</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</p>
    </div>
  );
}
```

### 6. Evaluation Results Component

```javascript
import { useEffect, useState } from 'react';
import interviewApiV2 from '@/api/interviewsV2';

export function EvaluationResults({ sessionId, evaluationJobId }) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);

  useEffect(() => {
    const pollEvaluation = async () => {
      try {
        const job = await interviewApiV2.getJobStatus(evaluationJobId);

        if (job.status === 'COMPLETED') {
          // Evaluation complete, fetch session details
          const session = await interviewApiV2.getInterviewById(sessionId);
          setEvaluation(session.evaluation);
          setPollingActive(false);
        } else if (job.status === 'FAILED') {
          console.error('Evaluation failed:', job.error);
          setPollingActive(false);
        }
      } finally {
        setLoading(false);
      }
    };

    if (pollingActive) {
      const interval = setInterval(pollEvaluation, 2000);
      return () => clearInterval(interval);
    }
  }, [sessionId, evaluationJobId, pollingActive]);

  if (loading || pollingActive) {
    return <div>Evaluating your interview... This may take a minute.</div>;
  }

  if (!evaluation) {
    return <div>Failed to generate evaluation</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Interview Evaluation</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <ScoreCard label="Technical" score={evaluation.technicalScore} />
        <ScoreCard label="Communication" score={evaluation.communicationScore} />
        <ScoreCard label="Confidence" score={evaluation.confidenceScore} />
        <ScoreCard label="Behavioral" score={evaluation.behavioralScore} />
      </div>

      <div>
        <h2>Strengths</h2>
        <ul>
          {evaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div>
        <h2>Areas for Improvement</h2>
        <ul>
          {evaluation.improvements?.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </div>

      <div>
        <h2>Detailed Feedback</h2>
        <p>{evaluation.detailedFeedback}</p>
      </div>
    </div>
  );
}

function ScoreCard({ label, score }) {
  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h3>{label}</h3>
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
      }}>
        {score}
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginTop: '10px' }}>
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}
```

## Data Flow Summary

### Mock Interview Flow
1. User uploads resume + JD
2. Backend creates Session, Resume, JobDescription (Prisma)
3. Claude API parses resume and generates questions
4. User starts interview → Claude RAG generates initial questions
5. User answers questions
6. Claude evaluates answers in real-time
7. Interview completes → Async evaluation job queued
8. Job processor generates final report with scores
9. Results displayed to user

### Proctored Interview Flow
1. Same as above, plus:
2. Browser loads face-api.js models
3. Video stream monitoring detects violations
4. Each violation → POST /api/interview/:id/proctor/event
5. 3 violations → Interview auto-terminated
6. Stream.io video SDK records session (optional)
7. Final evaluation includes proctor events data

## Environment Variables

Add to frontend `.env.local`:
```
VITE_API_BASE_URL=http://localhost:4000
VITE_DEEPGRAM_API_KEY=your_key_here  # Public key exposed to browser
```

## Testing

```bash
# Test backend
curl -X GET http://localhost:4000/health

# Test interview creation
curl -X POST http://localhost:4000/api/interview \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MOCK",
    "resumeText": "...",
    "jdText": "..."
  }'

# Test user dashboard
curl -X GET http://localhost:4000/api/user/v2/recruiter/dashboard \
  -H "Authorization: Bearer <clerk_token>"
```

## Troubleshooting

### "API endpoint not found"
- Ensure backend is running on port 4000
- Check that routes are registered in server.js
- Verify API client is using correct endpoint URLs

### "Session not found"
- Ensure session was created successfully
- Check session ID is passed correctly to API calls
- Verify authentication token is valid

### "Claude API errors"
- Check ANTHROPIC_API_KEY is set
- Verify API key has quota
- Check Claude API status

### "Deepgram WebSocket fails"
- Ensure DEEPGRAM_API_KEY is set
- Check browser console for WebSocket errors
- Verify audio permissions granted

## Next Steps

1. Install all dependencies: `npm install`
2. Configure .env variables
3. Run Prisma migrations: `npm run prisma:push`
4. Start backend: `npm run dev`
5. Start frontend: `npm run dev`
6. Test complete interview flow
7. Deploy to production
