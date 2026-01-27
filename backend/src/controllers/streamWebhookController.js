import { ENV } from "../lib/env.js";
import { Room } from "../models/Room.js";

// NOTE: No signature verification yet. We will enable it when ENV.STREAM_WEBHOOK_SECRET is set.
export const handleStreamWebhook = async (req, res) => {
  try {
    if (!ENV.STREAM_API_KEY || !ENV.STREAM_API_SECRET) {
      console.warn("[Stream Webhook] STREAM credentials are not set in ENV");
    }
    if (!process.env.STREAM_WEBHOOK_SECRET) {
      console.warn("[Stream Webhook] STREAM_WEBHOOK_SECRET not set – signature verification disabled");
    }

    const event = req.body || {};
    const type = event?.type || event?.event_type || event?.event;

    // Attempt to locate callId (we use callId === roomId)
    const callId =
      event?.call_id ||
      event?.call?.id ||
      event?.data?.call_id ||
      event?.video?.call?.id ||
      event?.callCid ||
      null;

    // Attempt to locate recording URL candidates
    const urlCandidates = [
      event?.recording?.url,
      event?.asset_url,
      event?.url,
      event?.data?.asset_url,
      event?.data?.url,
    ].filter(Boolean);
    const recordingUrl = urlCandidates.length ? urlCandidates[0] : null;

    // Only act on obvious recording completion events
    const isRecordingComplete = typeof type === "string" && /record/i.test(type) && /(complete|ready|finished)/i.test(type);

    if (!callId) {
      console.warn("[Stream Webhook] Missing callId in event", { type, keys: Object.keys(event) });
      return res.status(200).json({ ok: true });
    }

    if (!isRecordingComplete && !recordingUrl) {
      // Not a recording completion event we recognize; acknowledge without changes
      return res.status(200).json({ ok: true });
    }

    const room = await Room.findById(callId);
    if (!room) {
      console.warn("[Stream Webhook] Room not found for callId", callId);
      return res.status(200).json({ ok: true });
    }

    room.recordingActive = false;
    if (recordingUrl) {
      room.recordingUrl = recordingUrl;
    }
    await room.save();

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[Stream Webhook] Error handling webhook", err);
    return res.status(200).json({ ok: true }); // Always 200 to avoid retries storm during setup
  }
};
