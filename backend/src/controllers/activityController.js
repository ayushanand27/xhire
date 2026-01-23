import { Activity } from "../models/Activity.js";
import { Room } from "../models/Room.js";

// Log activity (called internally by socket events and REST endpoints)
export const logActivity = async (req, res, next) => {
  try {
    const { roomId, eventType, description, metadata } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const activity = new Activity({
      roomId,
      userId: req.user.id,
      userName: req.user.name,
      eventType,
      description,
      metadata,
      ipAddress: req.ip,
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room activity log
export const getRoomActivity = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50, eventType } = req.query;
    const skip = (page - 1) * limit;

    // Verify access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.isParticipant(req.user.id) && room.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You don't have access to this room's activity log" });
    }

    // Build query
    const query = { roomId };
    if (eventType) {
      query.eventType = eventType;
    }

    // Get paginated activity
    const activities = await Activity.find(query)
      .populate("userId", "name profileImage email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Can only view own activity or if room creator
    const activities = await Activity.find({ userId })
      .populate("roomId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments({ userId });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get activity by event type
export const getActivityByType = async (req, res) => {
  try {
    const { roomId, eventType } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const activities = await Activity.find({ roomId, eventType })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments({ roomId, eventType });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room statistics
export const getRoomStats = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.isParticipant(req.user.id) && room.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You don't have access to this room's statistics" });
    }

    const stats = {
      totalActivities: await Activity.countDocuments({ roomId }),
      uniqueUsers: await Activity.distinct("userId", { roomId }),
      eventBreakdown: await Activity.aggregate([
        { $match: { roomId } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      peakActivityTime: await Activity.aggregate([
        { $match: { roomId } },
        {
          $group: {
            _id: { $dateToString: { format: "%H:00", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      recentActivities: await Activity.find({ roomId })
        .populate("userId", "name profileImage")
        .sort({ createdAt: -1 })
        .limit(10),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
