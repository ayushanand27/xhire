import { prisma } from "../lib/prisma.js";
import {
  ensurePrismaUser,
  mapActivity,
  normalizeActivityEventType,
  resolveUserId,
} from "../lib/prismaAdapters.js";

// Log activity (called internally by socket events and REST endpoints)
export const logActivity = async (req, res, next) => {
  try {
    const { roomId, eventType, description, metadata } = req.body;

    const currentUser = await ensurePrismaUser(req.user);
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const activity = await prisma.activity.create({
      data: {
        roomId,
        userId: currentUser.id,
        userName: currentUser.name,
        eventType: normalizeActivityEventType(eventType),
        description: description || null,
        metadata: metadata ?? null,
        ipAddress: req.ip || null,
      },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
    });

    return res.status(201).json(await mapActivity(activity));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room activity log
export const getRoomActivity = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50, eventType } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const currentUser = await ensurePrismaUser(req.user);

    // Verify access
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        participants: true,
      },
    });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const isParticipant = room.participants.some((p) => p.userId === currentUser.id);
    if (!isParticipant && room.creatorId !== currentUser.id) {
      return res
        .status(403)
        .json({ error: "You don't have access to this room's activity log" });
    }

    // Build query
    const where = {
      roomId,
      ...(eventType ? { eventType: normalizeActivityEventType(eventType) } : {}),
    };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    const totalActivities = await prisma.activity.count({ where });

    return res.json({
      activities: await Promise.all(activities.map(mapActivity)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limitNum),
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
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const resolvedUser = await resolveUserId(userId);
    if (!resolvedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const where = { userId: resolvedUser.id };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    const totalActivities = await prisma.activity.count({ where });

    return res.json({
      activities: await Promise.all(activities.map(mapActivity)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limitNum),
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
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const currentUser = await ensurePrismaUser(req.user);

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const isParticipant = room.participants.some((p) => p.userId === currentUser.id);
    if (!isParticipant && room.creatorId !== currentUser.id) {
      return res.status(403).json({ error: "You don't have access to this room" });
    }

    const where = {
      roomId,
      eventType: normalizeActivityEventType(eventType),
    };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    const totalActivities = await prisma.activity.count({ where });

    return res.json({
      activities: await Promise.all(activities.map(mapActivity)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limitNum),
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

    const currentUser = await ensurePrismaUser(req.user);
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const isParticipant = room.participants.some((p) => p.userId === currentUser.id);
    if (!isParticipant && room.creatorId !== currentUser.id) {
      return res
        .status(403)
        .json({ error: "You don't have access to this room's statistics" });
    }

    const activities = await prisma.activity.findMany({
      where: { roomId },
      select: {
        userId: true,
        eventType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalActivities = activities.length;
    const uniqueUsers = new Set(activities.map((activity) => activity.userId));

    const eventCounts = new Map();
    const hourCounts = new Map();

    for (const activity of activities) {
      eventCounts.set(activity.eventType, (eventCounts.get(activity.eventType) || 0) + 1);
      const hourLabel = `${String(new Date(activity.createdAt).getHours()).padStart(2, "0")}:00`;
      hourCounts.set(hourLabel, (hourCounts.get(hourLabel) || 0) + 1);
    }

    const eventBreakdown = [...eventCounts.entries()]
      .map(([eventType, count]) => ({ eventType: eventType.toLowerCase().replace(/_/g, "-"), count }))
      .sort((a, b) => b.count - a.count);

    const peakActivityTime = [...hourCounts.entries()]
      .map(([hour, count]) => ({ _id: hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 1);

    const recentActivities = await prisma.activity.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const stats = {
      totalActivities,
      uniqueUsers: [...uniqueUsers],
      eventBreakdown,
      peakActivityTime,
      recentActivities: await Promise.all(recentActivities.map(mapActivity)),
    };

    return res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
