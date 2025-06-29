# Granite E2E Encrypted Notes - Better Auth Integration

## Overview

Granite has been updated to use [Better Auth](https://better-auth.com) for authentication instead of custom JWT implementation. Better Auth provides a robust, type-safe authentication solution with built-in support for Expo/React Native.

## Backend Changes (Hono API)

### Dependencies Added
- `better-auth`: Core authentication library
- Removed: `bcryptjs`, `jsonwebtoken` (replaced by better-auth)

### Key Changes
- **Authentication Handler**: Better Auth automatically handles all auth routes via `/api/auth/*`
- **Session Management**: Uses better-auth's built-in session management with cookies
- **User Context**: User information is now available via `c.get('user')` in protected routes
- **Database Integration**: Uses Drizzle adapter for better-auth

### API Configuration

```typescript
// apps/api/src/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [expo()],
  trustedOrigins: ["granite://", "granite://*"],
});
```

### Environment Variables

```bash
# .env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8081
ALLOWED_ORIGINS=http://localhost:3000,exp://192.168.1.100:8081
```

## Frontend Changes (Expo React Native)

### Dependencies Added
- `better-auth`: Client library
- `@better-auth/expo`: Expo-specific plugin
- `expo-secure-store`: Secure storage for session data

### Key Changes
- **Auth Client**: Centralized authentication client with Expo integration
- **Session Hook**: `useSession()` hook for reactive session state
- **Deep Linking**: Configured with `granite://` scheme for OAuth redirects
- **Authentication Screens**: Sign-in and sign-up screens with better-auth integration

### Client Configuration

```typescript
// apps/mobile/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: getBaseURL(), // Auto-detects dev/prod URLs
  plugins: [
    expoClient({
      scheme: "granite",
      storagePrefix: "granite",
      storage: SecureStore,
    })
  ]
});
```

### Authentication Flow

1. **Unauthenticated Users**: Redirected to `/auth/sign-in`
2. **Sign Up**: Create account with email/password
3. **Sign In**: Authenticate with email/password
4. **Session Management**: Automatic session persistence with SecureStore
5. **Sign Out**: Clears session and redirects to sign-in

## Running the Application

### Backend (API)
```bash
cd apps/api
bun run dev  # Starts on http://localhost:8081
```

### Frontend (Mobile)
```bash
cd apps/mobile
bun run dev  # Starts Expo development server
```

## API Endpoints

Better Auth automatically provides these endpoints:

- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User sign-in
- `POST /api/auth/sign-out` - User sign-out
- `GET /api/auth/session` - Get current session
- And many more...

## Protected Routes

Routes under `/api/notes/*`, `/api/sync/*`, and `/api/users/*` require authentication:

```typescript
// Example protected route
app.get('/api/notes', async (c) => {
  const user = c.get('user'); // Better Auth user object
  // Fetch notes for user.id
});
```

## Mobile Authentication

### Sign In Screen
- Email/password validation
- Error handling with alerts
- Navigation to tabs on success

### Sign Up Screen
- Name, email, password fields
- Password confirmation
- Automatic navigation to sign-in on success

### Session Management
- `useSession()` hook provides reactive session state
- Automatic session restoration on app launch
- Secure session storage with expo-secure-store

## Development Notes

1. **Metro Configuration**: Updated to support better-auth package exports
2. **Deep Linking**: App scheme `granite://` configured for OAuth flows
3. **Environment Detection**: Client automatically detects development vs production URLs
4. **Type Safety**: Better Auth provides full TypeScript support
5. **Rate Limiting**: Configured for development (1000 requests per 15 minutes)

## Migration Benefits

- **Security**: Better Auth handles security best practices automatically
- **Type Safety**: Full TypeScript support with inferred types
- **Maintenance**: Reduced custom authentication code
- **Features**: Built-in support for sessions, cookies, CSRF protection
- **Scalability**: Easy to add OAuth providers, 2FA, etc.
- **Mobile Integration**: Purpose-built Expo support

## Next Steps

1. Set up a real PostgreSQL database
2. Configure production environment variables
3. Add OAuth providers (Google, Apple, etc.)
4. Implement password reset functionality
5. Add user profile management
6. Set up email verification

## Documentation

- [Better Auth Documentation](https://better-auth.com)
- [Better Auth Expo Integration](https://better-auth.com/docs/integrations/expo)
- [Better Auth Hono Integration](https://better-auth.com/docs/integrations/hono)
