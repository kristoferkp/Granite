# Project: Granite - E2E Encrypted Notes App

## 1. Overview

Granite is a React Native application for creating, storing, and syncing end-to-end (E2E) encrypted notes. It uses Expo for development and better-auth for authentication. The primary goal is to provide a secure and private note-taking experience with dual-layer security:

1. **Account Password:** Used for user authentication and account access
2. **Encryption Password:** Separate password used exclusively for note encryption (non-recoverable)

## 2. Core Features

*   **Dual-Layer Authentication:** 
    *   Account authentication using email/password and social providers (better-auth)
    *   Separate encryption password for note protection (non-recoverable)
*   **E2E Encryption:** All notes are encrypted on the client-side with the user's encryption password before being sent to the server. The server only stores encrypted blobs.
*   **Cloud Storage:** Encrypted notes are stored in a cloud database.
*   **Cross-platform:** The app will work on iOS, Android, and the web, thanks to React Native and Expo.
*   **Note Management:** Create, read, update, and delete notes.
*   **Privacy by Design:** Encryption password is never sent to servers and cannot be recovered if lost.

## 3. Tech Stack

*   **Frontend:** React Native with Expo
*   **UI Toolkit:** Tamagui + React Native components
*   **Authentication:** `better-auth`
*   **Database:** Supabase (PostgreSQL) with Drizzle ORM
*   **Storage:** Supabase Storage for encrypted note files
*   **Encryption:** Expo Crypto with custom XOR implementation (demo - should use libsodium in production)

## 4. Architecture

### 4.1. Frontend

*   **`app/`:** Contains the main application screens (sign-in, sign-up, notes list, note editor).
*   **`components/`:** Reusable UI components.
*   **`lib/`:** Contains the core logic for authentication, encryption, and API communication.
    *   `auth.ts`: Handles authentication logic using `better-auth`.
    *   `crypto.ts`: Manages E2E encryption and decryption.
    *   `api.ts`: Communicates with the backend API.
*   **`db/`:** Drizzle ORM schema and client.

### 4.2. Backend/Storage

*   **Supabase Database:** Stores encrypted note metadata (title, storage path, IV, timestamps)
*   **Supabase Storage:** Stores encrypted note content as JSON files
*   **API Endpoints (via React Native client):**
    *   Note CRUD operations through `notesAPI` class
    *   All encryption/decryption happens client-side

### 4.3. Dual-Password Security Architecture

#### Account Authentication (Recoverable)
1. **User Sign-up/Sign-in:**
   * Uses better-auth with email/password or social providers
   * Account password can be reset via email recovery
   * Grants access to the app and user's encrypted note metadata

#### Note Encryption (Non-Recoverable)
1. **Encryption Password Setup:**
   * After account creation, user creates a separate encryption password
   * This password is used exclusively for encrypting/decrypting notes
   * **Critical:** This password cannot be recovered if lost - notes become permanently inaccessible
   * A strong encryption key is derived from this password using PBKDF2/Argon2
   * A unique salt is generated and stored locally on device
   * The encryption password and derived key are never sent to the server

2. **Note Creation/Editing:**
2. **Note Creation/Editing:**
    *   The note content is encrypted on the device using the encryption password-derived key
    *   Uses AES-256-GCM encryption (XOR for demo only)
    *   The encrypted content is uploaded to Supabase Storage as a JSON file
    *   Note metadata (title, storage path, IV) is stored in the database (linked to user account)

3. **Note Viewing:**
    *   User must enter their encryption password to access notes
    *   The encrypted note is fetched from Supabase Storage
    *   The content is decrypted on the device using the user's encryption-derived key
    *   If encryption password is forgotten, notes are permanently inaccessible

#### Security Benefits of Dual-Password System
- **Account Security:** Account password can be reset without losing access to the app
- **Data Privacy:** Even if account is compromised, notes remain encrypted and inaccessible
- **Zero-Knowledge:** Server never has access to encryption password or decrypted content
- **User Control:** Users can choose strong, unique encryption passwords independent of account credentials
- **Compliance:** Meets requirements for true end-to-end encryption with no server-side decryption capability

### 4.4. Implementation Details

*   **Encryption Library:** `lib/crypto.ts` - Custom XOR implementation (DEMO ONLY)
*   **API Client:** `lib/api.ts` - NotesAPI class for all note operations
*   **Hooks:** `lib/hooks/useNotes.ts` - React hooks for note management
*   **Credentials:** `lib/userCredentials.ts` - Manages dual-password system (account + encryption)
*   **UI Components:** `components/NotesList.tsx` - Reusable note display components

## 5. Project Structure (Implemented)

```
.
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── notes.tsx         // Main notes screen with E2E encryption
│   │   └── settings.tsx      // App settings
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── api/
│   └── auth/
│       └── [...auth]+api.ts  // Better-auth API routes
├── components/
│   ├── NotesList.tsx         // Note list and card components
│   └── ...
├── db/
│   ├── schema.ts            // Database schema with notes table
│   ├── auth-schema.ts       // Better-auth schema
│   └── index.ts
├── lib/
│   ├── auth.ts              // Better-auth configuration
│   ├── auth-client.ts       // Auth client setup
│   ├── supabase.ts          // Supabase client configuration
│   ├── crypto.ts            // E2E encryption utilities
│   ├── api.ts               // Notes API client
│   ├── userCredentials.ts   // Credential management
│   └── hooks/
│       └── useNotes.ts      // React hooks for notes
└── ...
```

## 6. Security Considerations & Implementation Status

### Current Implementation (Demo/Development)
- ⚠️ **XOR Encryption:** Using simplified XOR for demonstration - NOT production ready
- ⚠️ **AsyncStorage:** Storing encryption password in AsyncStorage - NOT secure
- ⚠️ **Simple Hashing:** Using basic hashing instead of proper key derivation

### Production Requirements
1. **Proper Key Derivation:** Use Argon2 or PBKDF2 instead of simple hashing
2. **Strong Encryption:** Use AES-256-GCM instead of XOR  
3. **Secure Storage:** Use device keychain/keystore for encryption password storage
4. **Dual-Password UX:** Implement clear UI flows for account vs encryption passwords
5. **Salt Management:** Implement proper salt generation and storage per user
6. **IV Security:** Use cryptographically secure random IV generation
7. **Password Recovery Warning:** Clear warnings that encryption password cannot be recovered
8. **Backup Options:** Consider encrypted backup/export options for user data

### Security Architecture Benefits
- **Account Compromise Protection:** Even if account password is leaked, notes remain encrypted
- **Zero-Knowledge Server:** Server cannot decrypt notes under any circumstances  
- **User Sovereignty:** Users have complete control over their encryption keys
- **Regulatory Compliance:** Meets strict privacy requirements (GDPR, HIPAA, etc.)
- **Plausible Deniability:** Account holders can deny knowledge of encryption password

## 7. Getting Started

1. **Setup Supabase:**
   - Create a new Supabase project
   - Create a 'notes' storage bucket
   - Add environment variables to `.env`

2. **Install Dependencies:**
   ```bash
   bun install
   ```

3. **Setup Database:**
   ```bash
   bun run setup-db
   ```

4. **Start Development:**
   ```bash
   bun run start
   ```
