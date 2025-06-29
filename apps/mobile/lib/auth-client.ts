import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// Get the base URL for the API
const getBaseURL = () => {
  if (__DEV__) {
    // In development, use the local IP or localhost
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    return debuggerHost ? `http://${debuggerHost}:8080` : 'http://localhost:8080';
  }
  
  // In production, use your actual API URL
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-api-domain.com';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    expoClient({
      scheme: "granite",
      storagePrefix: "granite",
      storage: SecureStore,
    })
  ]
});

// Export specific methods for convenience
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession
} = authClient;
