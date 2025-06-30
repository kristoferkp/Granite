import { db } from "@/db";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
 
export const auth = betterAuth({
    plugins: [expo()],
    baseURL:process.env.BETTER_AUTH_URL || "http://localhost:8081/",
    database: drizzleAdapter(db, {
        provider: "pg",
    }), 
    emailAndPassword: { 
        enabled: true,
        // Add this to allow sending verification emails (optional)
        sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
            console.log(`Verification email URL for ${user.email}: ${url}`);
            // In production, implement actual email sending
        }
    },
    session: {
        expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    },
    trustedOrigins: [
        "granite://*", 
        "http://localhost:8081", 
        "exp://*"  // For Expo Go
    ],
    secret: process.env.BETTER_AUTH_SECRET || ""
});