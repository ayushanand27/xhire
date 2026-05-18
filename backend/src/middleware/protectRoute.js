import { clerkClient } from "@clerk/express";
import { ENV } from "../lib/env.js";
import { ensurePrismaUser, mapPrismaUser } from "../lib/prismaAdapters.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("\n🔒 protectRoute middleware triggered");

    let clerkId = null;
    let sessionId = null;

    // 1) Prefer clerk middleware's auth if available
    try {
      const authResult = typeof req.auth === 'function' ? req.auth() : req.auth;
      if (authResult) {
        clerkId = authResult.userId || authResult?.user_id || authResult?.sub;
        sessionId = authResult.sessionId || authResult?.session_id;
        console.log("   Found auth from middleware", { clerkId, sessionId });
      }
    } catch (err) {
      console.log("   req.auth() not available or failed:", err?.message || err);
    }

    // 2) If no clerkId yet, verify Authorization: Bearer <token>
    if (!clerkId && req.headers.authorization) {
      const token = req.headers.authorization.replace(/^Bearer\s+/i, "");
      console.log("   Verifying Clerk token from Authorization header");
      try {
        // Prefer clerkClient.sessions.verifySessionToken if available
        let decoded = null;
        if (clerkClient?.sessions && typeof clerkClient.sessions.verifySessionToken === 'function') {
          decoded = await clerkClient.sessions.verifySessionToken(token);
        } else if (typeof clerkClient.verifyToken === 'function') {
          decoded = await clerkClient.verifyToken(token);
        } else {
          // Fallback: attempt to decode JWT locally (less secure, avoid in prod)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            decoded = payload;
          }
        }

        clerkId = decoded?.sub || decoded?.userId || decoded?.user_id || null;
        sessionId = decoded?.sessionId || decoded?.session_id || sessionId;
        console.log('   Clerk token verified, clerkId:', clerkId);
      } catch (verifyErr) {
        console.error('❌ Clerk token verification failed:', verifyErr?.message || verifyErr);
        return res.status(401).json({ message: 'Unauthorized - invalid token' });
      }
    }

    if (!clerkId) {
      console.error('❌ No userId found - user not authenticated');
      return res.status(401).json({ message: 'Unauthorized - Please sign in to continue' });
    }

    // Fetch Clerk user and ensure Prisma user exists
    let prismaUser;
    try {
      let clerkUser = null;
      try {
        clerkUser = await clerkClient.users.getUser(clerkId);
      } catch (clerkErr) {
        console.warn(
          "⚠️ Clerk user lookup failed, using fallback Prisma upsert:",
          clerkErr?.message || clerkErr
        );
      }

      prismaUser = await ensurePrismaUser({
        clerkId,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        fullName: clerkUser?.fullName,
        imageUrl: clerkUser?.imageUrl,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || clerkUser?.primaryEmailAddress?.emailAddress || "",
        role: 'CANDIDATE',
      });
    } catch (err) {
      console.error('❌ Failed to resolve Clerk/Prisma user:', err?.message || err);
      return res.status(401).json({ message: 'Unauthorized - user not found' });
    }

    // Attach both auth and mapped prisma user for controller compatibility
    req.user = mapPrismaUser(prismaUser);
    // Ensure controllers that read req.auth.userId keep working — provide Prisma user id
    req.auth = { userId: req.user.id, clerkId, sessionId };

    console.log('✅ Auth successful for user:', req.user.email);
    return next();
  } catch (error) {
    console.error('❌ Error in protectRoute:', error?.message || error);
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
};
