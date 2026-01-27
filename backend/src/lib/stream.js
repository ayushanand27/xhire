import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "./env.js";

// Lazy initialize clients - only create when first accessed
let chatClientInstance = null;
let streamClientInstance = null;

const getChatClient = () => {
  if (!chatClientInstance) {
    const apiKey = ENV.STREAM_API_KEY;
    const apiSecret = ENV.STREAM_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
    }
    
    chatClientInstance = StreamChat.getInstance(apiKey, apiSecret);
  }
  return chatClientInstance;
};

const getStreamClient = () => {
  if (!streamClientInstance) {
    const apiKey = ENV.STREAM_API_KEY;
    const apiSecret = ENV.STREAM_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
    }
    
    streamClientInstance = new StreamClient(apiKey, apiSecret);
  }
  return streamClientInstance;
};

export const chatClient = {
  getInstance: () => getChatClient(),
  upsertUser: async (userData) => getChatClient().upsertUser(userData),
  deleteUser: async (userId) => getChatClient().deleteUser(userId),
};

export const streamClient = {
  getInstance: () => getStreamClient(),
};

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Stream user upserted successfully:", userData);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};
