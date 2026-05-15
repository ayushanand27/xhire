import UserPreferences from "../models/UserPreferences.js";
import { User } from "../models/User.js";

// Get current authenticated user (for frontend identity bridging)
export const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    clerkId: req.user.clerkId,
    name: req.user.name,
    email: req.user.email,
    profileImage: req.user.profileImage,
    role: req.user.role,
    skills: req.user.skills || [],
    yearsOfExperience: req.user.yearsOfExperience || 0,
  });
};

export const updateMyProfile = async (req, res) => {
  try {
    const { role, skills, yearsOfExperience } = req.body;

    if (role && !["candidate", "recruiter"].includes(role)) {
      return res.status(400).json({ error: "role must be candidate or recruiter" });
    }

    if (role) req.user.role = role;
    if (Array.isArray(skills)) req.user.skills = skills.map((s) => String(s).trim()).filter(Boolean);

    if (typeof yearsOfExperience !== "undefined") {
      const numericYoe = Number(yearsOfExperience);
      if (Number.isNaN(numericYoe) || numericYoe < 0 || numericYoe > 60) {
        return res.status(400).json({ error: "yearsOfExperience must be a number between 0 and 60" });
      }
      req.user.yearsOfExperience = numericYoe;
    }

    await req.user.save();

    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage,
      role: req.user.role,
      skills: req.user.skills,
      yearsOfExperience: req.user.yearsOfExperience,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user._id });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user._id });
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { roomPreferences, codePreferences, notificationPreferences, privacySettings } =
      req.body;

    let preferences = await UserPreferences.findOne({ userId: req.user._id });

    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user._id });
    }

    // Update only provided fields
    if (roomPreferences) {
      preferences.roomPreferences = {
        ...preferences.roomPreferences,
        ...roomPreferences,
      };
    }

    if (codePreferences) {
      preferences.codePreferences = {
        ...preferences.codePreferences,
        ...codePreferences,
      };
    }

    if (notificationPreferences) {
      preferences.notificationPreferences = {
        ...preferences.notificationPreferences,
        ...notificationPreferences,
      };
    }

    if (privacySettings) {
      preferences.privacySettings = {
        ...preferences.privacySettings,
        ...privacySettings,
      };
    }

    await preferences.save();
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add room to favorites
export const addFavoriteRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    let preferences = await UserPreferences.findOne({ userId: req.user._id });

    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user._id });
    }

    if (!preferences.favoritedRooms.includes(roomId)) {
      preferences.favoritedRooms.push(roomId);
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove room from favorites
export const removeFavoriteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const preferences = await UserPreferences.findOne({ userId: req.user._id });

    if (!preferences) {
      return res.status(404).json({ error: "Preferences not found" });
    }

    preferences.favoritedRooms = preferences.favoritedRooms.filter(
      (id) => id.toString() !== roomId
    );

    await preferences.save();
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get favorite rooms
export const getFavoriteRooms = async (req, res) => {
  try {
    const preferences = await UserPreferences.findOne({ userId: req.user._id }).populate(
      "favoritedRooms",
      "name description roomType maxParticipants participants"
    );

    if (!preferences) {
      return res.json({ favoritedRooms: [] });
    }

    res.json({ favoritedRooms: preferences.favoritedRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    let preferences = await UserPreferences.findOne({ userId: req.user._id });

    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user._id });
    }

    if (!preferences.blockedUsers.includes(userId)) {
      preferences.blockedUsers.push(userId);
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const preferences = await UserPreferences.findOne({ userId: req.user._id });

    if (!preferences) {
      return res.status(404).json({ error: "Preferences not found" });
    }

    preferences.blockedUsers = preferences.blockedUsers.filter(
      (id) => id.toString() !== userId
    );

    await preferences.save();
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const preferences = await UserPreferences.findOne({ userId: req.user._id }).populate(
      "blockedUsers",
      "name profileImage email"
    );

    if (!preferences) {
      return res.json({ blockedUsers: [] });
    }

    res.json({ blockedUsers: preferences.blockedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Recruiter/admin directory view
export const getUserDirectory = async (req, res) => {
  try {
    if (!["recruiter", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Recruiter access required" });
    }

    const { role, search } = req.query;
    const filter = {};

    if (role && ["candidate", "recruiter", "admin"].includes(role)) {
      filter.role = role;
    }

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email profileImage role skills yearsOfExperience")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
