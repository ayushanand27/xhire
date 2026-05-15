import { ENV } from "./env.js";

/**
 * Deepgram STT Service
 * Handles WebSocket connections for real-time transcription
 * The client WebSocket connection is initiated from the browser with API key exposed via env
 * This service validates and processes transcription results
 */

export class DeepgramTranscriber {
  constructor() {
    this.apiKey = ENV.DEEPGRAM_API_KEY;
    this.apiUrl = "wss://api.deepgram.com/v1/listen";
  }

  /**
   * Generate a client-safe Deepgram connection URL for browser WebSocket
   * Returns the connection string with proper auth headers for browser use
   */
  getClientConnectionUrl(options = {}) {
    const params = new URLSearchParams({
      encoding: "linear16",
      sample_rate: "16000",
      channels: "1",
      model: "nova-2",
      language: "en",
      punctuate: "true",
      // Streaming options
      interim_results: "true",
      utterance_end_ms: "1000",
      vad_events: "true",
      ...options,
    });

    return `${this.apiUrl}?${params.toString()}`;
  }

  /**
   * Get auth headers for Deepgram API requests
   */
  getAuthHeaders() {
    return {
      Authorization: `Token ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Process a transcription result from Deepgram
   * Extract transcript, confidence, timing data
   */
  static processTranscriptionResult(result) {
    try {
      if (!result.channel || !result.channel.alternatives) {
        return null;
      }

      const alternatives = result.channel.alternatives;
      const bestAlternative = alternatives[0];

      if (!bestAlternative.transcript) {
        return null;
      }

      return {
        transcript: bestAlternative.transcript,
        confidence: bestAlternative.confidence || 0,
        words: bestAlternative.words || [],
        is_final: result.is_final || false,
      };
    } catch (error) {
      console.error("Error processing transcription result:", error);
      return null;
    }
  }

  /**
   * Extract words with timestamps for detailed logging
   */
  static extractWordTimings(words) {
    if (!Array.isArray(words)) return [];

    return words.map((w) => ({
      word: w.word,
      start: w.start || 0,
      end: w.end || 0,
      confidence: w.confidence || 0,
    }));
  }
}

export default DeepgramTranscriber;
