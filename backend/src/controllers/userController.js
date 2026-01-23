import UserPreferences from "../models/UserPreferences.js";

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.id });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.id });
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

    let preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.id });
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

    let preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.id });
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

    const preferences = await UserPreferences.findOne({ userId: req.user.id });

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
    const preferences = await UserPreferences.findOne({ userId: req.user.id }).populate(
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

    if (userId === req.user.id) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    let preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.id });
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

    const preferences = await UserPreferences.findOne({ userId: req.user.id });

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
    const preferences = await UserPreferences.findOne({ userId: req.user.id }).populate(
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
