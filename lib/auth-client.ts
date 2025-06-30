import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
 
export const authClient = createAuthClient({
    // If running on a physical device, use your computer's local network IP instead of localhost
    baseURL: process.env.EXPO_PUBLIC_API_URL!, // Base URL of your Better Auth backend API route
    plugins: [
        expoClient({
            scheme: "granite",
            storagePrefix: "granite",
            storage: SecureStore,
        })
    ]
});