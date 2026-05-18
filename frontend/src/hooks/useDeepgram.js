import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useDeepgram - React hook to stream microphone audio to Deepgram Realtime over WebSocket
 * Returns: { isListening, startListening, stopListening, liveTranscript, error }
 *
 * Notes:
 * - Pass your DEEPGRAM_API_KEY into startListening or set it via environment in the client (not recommended).
 * - Uses the nova-2 model with interim results enabled by default.
 */
export default function useDeepgram({ model = 'nova-2', interimResults = true } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const handleMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.data);

      // Deepgram realtime returns transcripts under channel.alternatives[0].transcript
      const transcript =
        msg?.channel?.alternatives?.[0]?.transcript ?? msg?.transcript ?? '';

      const isFinal = msg?.is_final || msg?.type === 'final';

      if (transcript) {
        if (isFinal) {
          // append final transcript to liveTranscript and keep it
          setLiveTranscript((prev) => (prev ? prev + '\n' + transcript : transcript));
        } else {
          // interim update — show as last line
          setLiveTranscript((prev) => {
            const lines = prev.split('\n');
            lines[lines.length - 1] = transcript; // replace last
            return lines.join('\n');
          });
        }
      }
    } catch (err) {
      // non-JSON messages may be ignored
      console.warn('Deepgram websocket message parse failed', err);
    }
  }, []);

  const connectWebSocket = useCallback((apiKey) => {
    if (!apiKey) {
      throw new Error('Deepgram API key required');
    }

    const params = new URLSearchParams({
      model,
      interim_results: interimResults ? 'true' : 'false',
    });

    // Deepgram accepts API key as access_token query param for browser websockets
    params.set('access_token', apiKey);

    const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;
    const ws = new WebSocket(url);

    ws.addEventListener('open', () => {
      console.debug('Deepgram WebSocket opened');
    });

    ws.addEventListener('message', handleMessage);
    ws.addEventListener('error', (ev) => {
      console.error('Deepgram WebSocket error', ev);
      setError(new Error('Deepgram websocket error'));
    });
    ws.addEventListener('close', () => {
      console.debug('Deepgram WebSocket closed');
    });

    wsRef.current = ws;
    return ws;
  }, [handleMessage, interimResults, model]);

  const startListening = useCallback(async (apiKey) => {
    setError(null);
    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ws = connectWebSocket(apiKey);

      // Use MediaRecorder to capture Opus/webm chunks and forward raw bytes to Deepgram
      const options = { mimeType: 'audio/webm;codecs=opus' };
      const mr = new MediaRecorder(stream, options);

      mr.addEventListener('dataavailable', async (e) => {
        if (!e.data || e.data.size === 0) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        try {
          const arrayBuffer = await e.data.arrayBuffer();
          // Send raw binary bytes directly — Deepgram accepts raw audio frames
          ws.send(arrayBuffer);
        } catch (sendErr) {
          console.error('Failed to send audio chunk to Deepgram', sendErr);
        }
      });

      mr.addEventListener('stop', () => {
        // Optionally signal end of stream; Deepgram treats socket close as end
        try {
          ws.close();
        } catch (e) {
          // ignore
        }
      });

      mediaRecorderRef.current = mr;
      // Prepare transcript state (start with empty line for interim updates)
      setLiveTranscript('');

      mr.start(250); // emit blobs every 250ms
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start Deepgram listening', err);
      setError(err);
      throw err;
    }
  }, [connectWebSocket, isListening]);

  const stopListening = useCallback(() => {
    try {
      setIsListening(false);
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== 'inactive') mr.stop();

      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      wsRef.current = null;
      mediaRecorderRef.current = null;
    } catch (err) {
      console.warn('Error stopping Deepgram listener', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { isListening, startListening, stopListening, liveTranscript, error };
}
