import axios from 'axios';
import { ENV } from '../lib/env.js';

/**
 * Mint a short-lived Deepgram realtime token using the server-side API key.
 * Returns { token: string, expires_in?: number }
 */
export async function getDeepgramToken(req, res) {
  try {
    if (!ENV.DEEPGRAM_API_KEY) {
      return res.status(500).json({ error: 'Deepgram API key not configured on server' });
    }

    // Deepgram realtime token endpoint — create an ephemeral token for client use
    // API: POST https://api.deepgram.com/v1/realtime?model=nova-2
    const params = new URLSearchParams({ model: 'nova-2' });
    const url = `https://api.deepgram.com/v1/realtime?${params.toString()}`;

    const response = await axios.post(url, null, {
      headers: {
        Authorization: `Token ${ENV.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    // Expecting an object containing a client_secret or token field
    const data = response.data || {};
    // Deepgram may return { client_secret: { value: '...' } }
    const token = data?.client_secret?.value || data?.token || data?.key || data?.client_secret || null;

    if (!token) {
      return res.status(502).json({ error: 'Unexpected Deepgram response', data });
    }

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error minting Deepgram token:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return res.status(status).json({ error: error?.response?.data || error.message });
  }
}

export default { getDeepgramToken };
