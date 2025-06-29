# Granite - E2E Encrypted Notes App Design Document

## Overview

Granite is an end-to-end encrypted notes application built with React Native and Expo, providing users with secure, private note-taking capabilities across iOS, Android, and web platforms.

## Core Features

### 🔒 Security & Privacy
- **End-to-End Encryption**: All notes encrypted locally before syncing
- **Zero-Knowledge Architecture**: Server never has access to decrypted content
- **Local-First**: Notes work offline, sync when connected
- **Biometric Authentication**: Face ID/Touch ID/Fingerprint unlock
- **Auto-lock**: Configurable timeout for security

### 📝 Note Management
- **Rich Text Editor**: Markdown support with live preview
- **Categories/Tags**: Organize notes with custom tags
- **Search**: Full-text search across encrypted notes
- **Archive**: Archive old notes without deletion
- **Favorites**: Quick access to frequently used notes
- **Templates**: Predefined note templates for common use cases

### 🎨 User Experience
- **Dark/Light Mode**: Automatic and manual theme switching
- **Offline Support**: Full functionality without internet
- **Cross-Platform Sync**: Seamless sync across devices
- **Export/Import**: Secure backup and restore functionality
- **Share**: Encrypted sharing via secure links

## Technical Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tooling
- **TypeScript**: Type safety and better developer experience
- **Expo Router**: File-based routing system
- **React Native Reanimated**: Smooth animations and gestures

### Encryption & Security
- **Encryption Algorithm**: AES-256-GCM for note content
- **Key Derivation**: PBKDF2 with user password + device salt
- **Key Storage**: iOS Keychain / Android Keystore
- **Transport Security**: TLS 1.3 for all network communications

### Data Storage
- **Local Storage**: SQLite with SQLCipher for encrypted local database
- **Cloud Sync**: End-to-end encrypted sync service
- **Conflict Resolution**: Last-write-wins with merge capabilities

## User Interface Design

### Design System

#### Color Palette
```typescript
// Light Theme
const lightColors = {
  primary: '#6366F1',      // Indigo
  secondary: '#8B5CF6',    // Purple
  background: '#FFFFFF',   // White
  surface: '#F8FAFC',      // Light gray
  text: '#1E293B',         // Dark gray
  textSecondary: '#64748B', // Medium gray
  border: '#E2E8F0',       // Light border
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
};

// Dark Theme
const darkColors = {
  primary: '#818CF8',      // Light indigo
  secondary: '#A78BFA',    // Light purple
  background: '#0F172A',   // Dark navy
  surface: '#1E293B',      // Dark gray
  text: '#F1F5F9',         // Light gray
  textSecondary: '#94A3B8', // Medium gray
  border: '#334155',       // Dark border
  success: '#34D399',      // Light green
  warning: '#FBBF24',      // Light amber
  error: '#F87171',        // Light red
};
```

#### Typography
- **Primary Font**: Inter (system font fallback)
- **Monospace**: SF Mono / Roboto Mono for code blocks
- **Scale**: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 40px

#### Spacing
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Screen Layouts

#### 1. Authentication Flow
- **Welcome Screen**: App introduction and value proposition
- **Login Screen**: Email/password with biometric option
- **Register Screen**: Account creation with encryption key setup
- **Biometric Setup**: Optional biometric authentication setup

#### 2. Main Application
- **Notes List**: Grid/list view of all notes with search
- **Note Editor**: Rich text editor with toolbar
- **Settings**: Security, sync, theme, and app preferences
- **Categories**: Tag management and organization

#### 3. Navigation Structure
```
Tab Navigation:
├── Notes (Home)
├── Search
├── Categories
└── Settings

Modal Screens:
├── Note Editor
├── Category Manager
├── Settings Details
└── Security Settings
```

## File Structure & Components

### Core Components

#### Authentication Components
```
components/auth/
├── WelcomeScreen.tsx
├── LoginForm.tsx
├── RegisterForm.tsx
├── BiometricSetup.tsx
└── AuthProvider.tsx
```

#### Note Components
```
components/notes/
├── NotesList.tsx
├── NoteCard.tsx
├── NoteEditor.tsx
├── RichTextToolbar.tsx
├── NotePreview.tsx
└── SearchBar.tsx
```

#### UI Components
```
components/ui/
├── Button.tsx
├── Input.tsx
├── Modal.tsx
├── LoadingSpinner.tsx
├── EmptyState.tsx
└── ConfirmationDialog.tsx
```

### Services & Utilities

#### Encryption Service
```
services/
├── encryption/
│   ├── EncryptionService.ts
│   ├── KeyManager.ts
│   └── CryptoUtils.ts
├── storage/
│   ├── DatabaseService.ts
│   ├── SecureStorage.ts
│   └── SyncService.ts
└── auth/
    ├── AuthService.ts
    └── BiometricAuth.ts
```

## Data Models

### Note Model
```typescript
interface Note {
  id: string;
  title: string;
  content: string; // Encrypted
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isFavorite: boolean;
  encryptionVersion: string;
  contentHash: string; // For sync conflict resolution
}
```

### User Model
```typescript
interface User {
  id: string;
  email: string;
  encryptionSalt: string;
  createdAt: Date;
  lastSyncAt?: Date;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  autoLockTimeout: number; // minutes
  biometricEnabled: boolean;
  syncEnabled: boolean;
  defaultNoteTemplate?: string;
}
```

## Security Considerations

### Encryption Flow
1. **Key Derivation**: User password + device salt → Master Key
2. **Note Encryption**: Master Key → Data Encryption Key → Encrypted Note
3. **Storage**: Only encrypted data stored locally and remotely
4. **Decryption**: Reverse process with user authentication

### Threat Model
- **Local Device Compromise**: Encrypted storage + biometric lock
- **Network Interception**: TLS + E2E encryption
- **Server Compromise**: Zero-knowledge architecture
- **Backup/Export**: Encrypted backups with separate password

## Development Phases

### Phase 1: Core Functionality (MVP)
- [ ] Basic note creation, editing, deletion
- [ ] Local encryption and storage
- [ ] Authentication system
- [ ] Basic UI with light/dark themes

### Phase 2: Enhanced Features
- [ ] Rich text editing with Markdown
- [ ] Categories and tagging system
- [ ] Search functionality
- [ ] Export/import capabilities

### Phase 3: Advanced Features
- [ ] Cloud sync with E2E encryption
- [ ] Biometric authentication
- [ ] Advanced editor features
- [ ] Sharing capabilities

### Phase 4: Polish & Performance
- [ ] Performance optimizations
- [ ] Advanced animations
- [ ] Accessibility improvements
- [ ] Platform-specific optimizations

## Dependencies & Libraries

### Core Dependencies
```json
{
  "react-native-crypto": "^2.2.0",
  "react-native-keychain": "^8.1.3",
  "react-native-sqlite-storage": "^6.0.1",
  "react-native-biometrics": "^3.0.1",
  "@react-native-async-storage/async-storage": "^1.19.3",
  "react-native-markdown-editor": "^2.1.0",
  "react-native-vector-icons": "^10.0.0",
  "react-native-gesture-handler": "^2.24.0",
  "react-native-reanimated": "^3.17.4"
}
```

### Development Dependencies
```json
{
  "@types/crypto-js": "^4.1.2",
  "detox": "^20.13.0",
  "jest": "^29.5.0",
  "@testing-library/react-native": "^12.3.0"
}
```

## Testing Strategy

### Unit Tests
- Encryption/decryption functions
- Data models and utilities
- Component logic

### Integration Tests
- Authentication flow
- Note CRUD operations
- Sync functionality

### E2E Tests
- Complete user journeys
- Cross-platform compatibility
- Performance benchmarks

## Accessibility

### Requirements
- Screen reader support (VoiceOver/TalkBack)
- Dynamic text sizing
- High contrast mode support
- Keyboard navigation
- Voice control compatibility

### Implementation
- Semantic markup with accessibility props
- Focus management
- Descriptive labels and hints
- Alternative text for images

## Performance Targets

### Metrics
- **App Launch**: < 2 seconds cold start
- **Note Loading**: < 500ms for 1000 notes
- **Search**: < 300ms for full-text search
- **Sync**: < 5 seconds for 100 notes
- **Memory Usage**: < 150MB typical usage

### Optimization Strategies
- Lazy loading for large note lists
- Efficient encryption/decryption
- Optimized database queries
- Image optimization and caching
- Bundle size optimization

## Privacy & Compliance

### Data Handling
- **No Analytics**: No user behavior tracking
- **Minimal Metadata**: Only essential sync metadata
- **Local Processing**: All encryption/decryption local
- **Optional Cloud**: Sync is opt-in feature

### Compliance Considerations
- GDPR compliance for EU users
- CCPA compliance for California users
- Data portability and deletion rights
- Transparent privacy policy

---

*This design document is a living document and will be updated as the project evolves.*
