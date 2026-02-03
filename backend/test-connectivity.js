// API Connectivity Test Script
import dotenv from "dotenv";
import mongoose from "mongoose";
import { StreamChat } from "stream-chat";

// Load environment variables
dotenv.config();

const ENV_KEYS = {
  DB_URL: process.env.DB_URL,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
};

console.log("\n🔍 Testing API Connectivity...\n");

// Test MongoDB
async function testMongoDB() {
  try {
    if (!ENV_KEYS.DB_URL) throw new Error("DB_URL not set");
    await mongoose.connect(ENV_KEYS.DB_URL);
    console.log("✅ MongoDB: Connected successfully");
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error("❌ MongoDB: Failed -", error.message);
    return false;
  }
}

// Test Stream.io
async function testStream() {
  try {
    if (!ENV_KEYS.STREAM_API_KEY || !ENV_KEYS.STREAM_API_SECRET) {
      throw new Error("Stream keys not set");
    }
    const client = StreamChat.getInstance(ENV_KEYS.STREAM_API_KEY, ENV_KEYS.STREAM_API_SECRET);
    await client.updateAppSettings({ enforce_unique_usernames: "no" });
    console.log("✅ Stream.io: Connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Stream.io: Failed -", error.message);
    return false;
  }
}

// Test Clerk
async function testClerk() {
  try {
    if (!ENV_KEYS.CLERK_SECRET_KEY) throw new Error("Clerk key not set");
    const response = await fetch("https://api.clerk.com/v1/users?limit=1", {
      headers: {
        Authorization: `Bearer ${ENV_KEYS.CLERK_SECRET_KEY}`,
      },
    });
    if (response.ok) {
      console.log("✅ Clerk: API key valid");
      return true;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Clerk: Failed -", error.message);
    return false;
  }
}

// Test Piston API
async function testPiston() {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/runtimes");
    if (response.ok) {
      console.log("✅ Piston API: Available (no auth required)");
      return true;
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error("❌ Piston API: Failed -", error.message);
    return false;
  }
}

// Test Inngest
function testInngest() {
  if (ENV_KEYS.INNGEST_EVENT_KEY) {
    console.log("✅ Inngest: Keys configured");
    return true;
  } else {
    console.error("❌ Inngest: Keys not set");
    return false;
  }
}

// Run all tests
(async () => {
  console.log("=" .repeat(50));
  const results = {
    mongodb: await testMongoDB(),
    stream: await testStream(),
    clerk: await testClerk(),
    piston: await testPiston(),
    inngest: testInngest(),
  };

  console.log("\n" + "=".repeat(50));
  console.log("📊 CONNECTIVITY SUMMARY\n");
  
  Object.entries(results).forEach(([service, status]) => {
    console.log(`${status ? "✅" : "❌"} ${service.toUpperCase()}: ${status ? "Working" : "Failed"}`);
  });

  const allWorking = Object.values(results).every((v) => v);
  
  console.log("\n" + "=".repeat(50));
  if (allWorking) {
    console.log("🎉 All services connected successfully!");
  } else {
    console.log("⚠️  Some services need attention");
  }
  console.log("=" .repeat(50) + "\n");

  process.exit(allWorking ? 0 : 1);
})();
