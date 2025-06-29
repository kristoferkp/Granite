import { db } from "@/db";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
 
export const auth = betterAuth({
    plugins: [expo()],
    database: drizzleAdapter(db, {
        provider: "pg",
    }), 
    emailAndPassword: { 
        enabled: true,
      }, 
    trustedOrigins: ["granite://*"]
});