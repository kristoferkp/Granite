# Granite - E2E Encrypted Notes App

A secure, privacy-focused notes application built with end-to-end encryption. This monorepo contains the mobile app, API server, and shared packages.

## 🏗️ Monorepo Structure

```
granite-monorepo/
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── api/             # Hono API server
├── packages/
│   └── shared/          # Shared types and utilities
├── package.json         # Root workspace configuration
└── DESIGN.md           # Detailed design document
```

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (latest version)
- Node.js 18+ (for Expo CLI compatibility)
- iOS Simulator / Android Emulator for mobile development

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd Granite
   bun install
   ```

2. **Environment setup:**
   ```bash
   # Copy API environment template
   cp apps/api/.env.example apps/api/.env
   # Edit the .env file with your database and JWT configuration
   ```

## 📱 Development

### Start all services
```bash
bun dev
```

### Start individual services
```bash
# Mobile app
bun app:dev

# API server  
bun api:dev

# Shared package (watch mode)
bun shared:build
```

## 🏗️ Workspace Commands

### Building
```bash
# Build all packages
bun build

# Build specific package
bun --filter @granite/shared build
bun --filter @granite/api build
```

### Testing
```bash
# Run all tests
bun test

# Test specific workspace
bun --filter @granite/api test
```

### Linting
```bash
# Lint all packages
bun lint

# Lint specific package
bun --filter @granite/mobile lint
```

## 📦 Packages

### Apps

#### `@granite/app` (Mobile)
- **Tech Stack:** React Native, Expo, TypeScript
- **Features:** E2E encrypted notes, offline-first, biometric auth
- **Development:** `bun app:dev`

#### `@granite/api` (Server)
- **Tech Stack:** Hono, TypeScript, Drizzle ORM, PostgreSQL  
- **Features:** Zero-knowledge API, JWT auth, note sync
- **Development:** `bun api:dev`

### Packages

#### `@granite/shared`
- **Purpose:** Shared types, utilities, and validation schemas
- **Exports:** Types, utilities, Zod schemas
- **Used by:** Both mobile app and API server

## 🔧 Workspace Configuration

This monorepo uses **Bun workspaces** with catalog management for consistent dependency versions:

### Catalogs
- **Default catalog:** Core dependencies (React, TypeScript, etc.)
- **expo:** Expo-specific packages
- **react-native:** React Native navigation and UI packages  
- **api:** Backend-specific packages (Hono, database, etc.)
- **dev:** Development and build tools

### Adding Dependencies

```bash
# Add to specific workspace
cd apps/mobile && bun add react-native-keychain

# Add using workspace filter
bun --filter @granite/api add drizzle-orm

# Add to catalog (from root)
# Edit package.json catalogs section
```

## 🚀 Deployment

### API Server
```bash
# Build for production
bun --filter @granite/api build

# Start production server
bun --filter @granite/api start
```

### Mobile App
```bash
# Build for iOS
cd apps/mobile && bun ios --configuration Release

# Build for Android  
cd apps/mobile && bun android --mode release
```

## 🔒 Security Features

- **End-to-end encryption** using AES-256-GCM
- **Zero-knowledge architecture** - server never sees decrypted content
- **Local-first design** with optional cloud sync
- **Biometric authentication** support
- **Secure key derivation** using PBKDF2

## 📖 Documentation

- [Design Document](./DESIGN.md) - Complete technical specification
- [API Documentation](./apps/api/README.md) - API endpoints and schemas
- [Mobile App Guide](./apps/mobile/README.md) - React Native app documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes in the appropriate workspace
4. Test your changes: `bun test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
