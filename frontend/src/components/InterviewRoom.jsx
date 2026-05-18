import React, { useEffect, useState, useRef } from 'react';
import useDeepgram from '../hooks/useDeepgram';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from '../lib/axios';

// Ensure we always call the backend (default to localhost:4000 to match backend)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Basic Tailwind styling; expects Tailwind configured in app
export default function InterviewRoom() {
  const { sessionId: routeSessionId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [sessionId, setSessionId] = useState(routeSessionId || null);
  const [resumeId, setResumeId] = useState(null);
  const [jdContent, setJdContent] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);
  const { isListening, startListening, stopListening, liveTranscript, error } = useDeepgram();
  const controllerRef = useRef(null);

  const { getToken } = useAuth();
  // Helper to get Clerk token (uses Clerk React hook)
  async function getClerkToken() {
    try {
      if (!getToken) return null;
      const token = await getToken();
      return token;
    } catch (err) {
      console.warn('Unable to get Clerk token via useAuth', err);
      return null;
    }
  }

  // Helper to fetch Deepgram token from backend
  async function fetchDeepgramToken() {
    const resp = await axios.get('/api/deepgram/token');
    return resp.data.token;
  }

  // Fetch a question (streaming) from backend
    async function fetchQuestion(providedSessionId, resumeIdArg, jdContentArg) {
    setLoadingQuestion(true);
    setCurrentQuestion('');
    try {
      const sId = providedSessionId || sessionId || routeSessionId;
        const payload = {
          sessionId: sId,
          resumeId: resumeIdArg ?? resumeId,
          jdContent: jdContentArg ?? jdContent,
          conversationHistory: [],
          questionNumber,
        };
        // Defensive validation before sending to backend
        if (!payload.resumeId || !payload.jdContent) {
          console.error('fetchQuestion aborted — missing resumeId or jdContent', payload);
          throw new Error('Missing resumeId or jdContent');
        }
      const token = await getClerkToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/api/interview/question`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to get question');
      }

      // Read streaming SSE-like body
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let question = '';
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          // Remove SSE prefixes like 'data: '
          const cleaned = chunk.replace(/data:\s*/g, '').replace(/event:\s*done\s*/g, '');
          question += cleaned;
          setCurrentQuestion(question);
        }
      }
    } catch (err) {
      console.error('Failed to fetch question:', err);
      setCurrentQuestion('Error fetching question');
    } finally {
      setLoadingQuestion(false);
    }
  }

  useEffect(() => {
    // On mount (or when routeSessionId changes) fetch session data then first question
    (async function init() {
      const sId = routeSessionId || sessionId;
      if (!sId) return;
      setSessionId(sId);
      try {
        // fetch session metadata from backend and defensively parse JSON
        const token = await getClerkToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const resp = await fetch(`${API_BASE}/api/interview/${sId}`, { headers });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => null);
          console.error('Failed to load session', txt || resp.statusText);
          return;
        }
        let data;
        try {
          data = await resp.json();
        } catch (jsonErr) {
          const raw = await resp.text().catch(() => null);
          console.error('Expected JSON from /api/interview/:id but received:', raw);
          throw jsonErr;
        }
        // Log session payload for debugging
        console.log('Session payload from GET /api/interview/:id', data);
        setResumeId(data.resumeId || data.resume?.id);
        setJdContent(data.jd?.content || data.jdContent || '');
        // ensure we start at question 1
        setQuestionNumber(1);
        setAnsweredCount(0);
        // fetch first question using the session id and the loaded resume/jd
        await fetchQuestion(sId, data.resumeId || data.resume?.id, data.jd?.content || data.jdContent || '');
      } catch (err) {
        console.error('Failed to init interview room', err);
      }
    })();
  }, [routeSessionId]);

  // Speak each question aloud when it finishes loading
  useEffect(() => {
    if (!loadingQuestion && currentQuestion && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(currentQuestion);
        // Optionally set voice/rate/pitch here
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn('TTS failed', e);
      }
    }
  }, [currentQuestion, loadingQuestion]);

  // Start microphone and transcription
  async function handleStart() {
    try {
      const token = await fetchDeepgramToken();
      await startListening(token);
    } catch (err) {
      console.error('Start listening failed', err);
    }
  }

  // Stop and submit transcript, then fetch next question
  async function handleSubmit() {
    try {
      // stop recording first to finalize transcript
      stopListening();
      // Post final transcript to backend
      const currentSessionId = sessionId || routeSessionId;
      if (!currentSessionId) {
        console.error('handleSubmit: missing sessionId', { sessionId, routeSessionId });
        return;
      }
      if (!liveTranscript || !liveTranscript.trim()) {
        console.error('handleSubmit: empty transcript, aborting submit');
        return;
      }
      console.log('Posting interview message', { sessionId: currentSessionId, preview: liveTranscript.slice(0, 200) });
      await axios.post('/api/interview/message', { sessionId: currentSessionId, content: liveTranscript });

      // Advance question number and fetch next
      const newCount = answeredCount + 1;
      setAnsweredCount(newCount);
      setQuestionNumber(newCount + 1);
      // If we've answered 10 questions, trigger evaluation and navigate to results
      if (newCount >= 10) {
        // call evaluate endpoint
        try {
          const currentSessionId = sessionId || routeSessionId;
          const er = await axios.post('/api/interview/evaluate', { sessionId: currentSessionId });
          if (!er) console.error('Evaluation request failed');
          else {
            const evalRes = er.data;
            // navigate to results page
            navigate(`/results/${currentSessionId}`);
            return;
          }
        } catch (evalErr) {
          console.error('Evaluation failed', evalErr);
        }
      }

      // fetch next question
      await fetchQuestion();
    } catch (err) {
      console.error('Submit failed', err);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Interview Room</h2>

      <div className="bg-white shadow p-4 rounded mb-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-medium">Question</h3>
          <div className="text-sm text-gray-600">Question {Math.min(questionNumber, 10)}/10</div>
        </div>
        <p className="mt-2 text-gray-800 min-h-[4rem]">{loadingQuestion ? 'Loading...' : currentQuestion}</p>
      </div>

      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-medium">Live Transcript</h3>
        <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{liveTranscript || 'Press Start to record your answer'}</pre>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={isListening}
        >
          Start
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit Answer
        </button>

        <button
          onClick={() => stopListening()}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop
        </button>
      </div>

      {error && <p className="mt-4 text-red-600">Error: {error.message}</p>}

    </div>
  );
}
