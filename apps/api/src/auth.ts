import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  
  // Configure email and password authentication
  emailAndPassword: {
    enabled: true,
  },
  
  // Add Expo plugin for mobile support
  plugins: [expo()],
  
  // Configure trusted origins for deep linking
  trustedOrigins: [
    "granite://", // App scheme for deep linking
    "granite://*", // Wildcard support for all paths
    ...(process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'])
  ],
  
  // Configure advanced options for cross-origin scenarios
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      partitioned: true // For browser standards compliance
    }
  }
});
