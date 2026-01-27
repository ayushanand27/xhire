import { Room } from "../models/Room.js";

const isAuthorizedRecorder = (participant) => {
  if (!participant) return false;
  return ["creator", "interviewer", "presenter"].includes(participant.role);
};

export const startRecording = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const { recordingUrl } = req.body || {};

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const participant = room.getParticipant(userId);
    if (!isAuthorizedRecorder(participant)) {
      return res.status(403).json({ error: "Not allowed to start recording" });
    }

    room.recordingActive = true;
    room.recordingStartedAt = new Date();
    if (recordingUrl) room.recordingUrl = recordingUrl;
    await room.save();

    res.json({ message: "Recording started", room });
  } catch (error) {
    res.status(500).json({ error: "Failed to start recording" });
  }
};

export const stopRecording = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const { recordingUrl } = req.body || {};

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const participant = room.getParticipant(userId);
    if (!isAuthorizedRecorder(participant)) {
      return res.status(403).json({ error: "Not allowed to stop recording" });
    }

    room.recordingActive = false;
    if (recordingUrl) room.recordingUrl = recordingUrl;
    await room.save();

    res.json({ message: "Recording stopped", room });
  } catch (error) {
    res.status(500).json({ error: "Failed to stop recording" });
  }
};
