import { z } from 'zod';

// User types
export interface User {
  id: string;
  email: string;
  encryptionSalt: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isVerified: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  autoLockTimeout: number; // minutes
  biometricEnabled: boolean;
  syncEnabled: boolean;
  defaultNoteTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note types
export interface Note {
  id: string;
  userId: string;
  title: string; // Encrypted on client side
  content: string; // Encrypted on client side
  tags: string[]; // Array of encrypted tags
  isArchived: boolean;
  isFavorite: boolean;
  encryptionVersion: string;
  contentHash: string; // For conflict resolution
  deviceId?: string; // Last device that modified this note
  syncVersion: number; // For sync conflict resolution
  createdAt: Date;
  updatedAt: Date;
}

// Sync types
export interface SyncMetadata {
  id: string;
  userId: string;
  deviceId: string;
  lastSyncAt: Date;
  syncCursor?: string; // For incremental sync
  deviceInfo?: string; // JSON string with device details
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  encryptionSalt: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    encryptionSalt?: string;
    lastLoginAt?: Date;
  };
  token: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  deviceId?: string;
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
  deviceId?: string;
}

export interface SyncRequest {
  deviceId: string;
  lastSyncCursor?: string;
  notes?: Note[];
}

export interface SyncResponse {
  notes: Note[];
  deletedNoteIds: string[];
  syncCursor: string;
  conflicts: Note[];
}

// Validation schemas using Zod
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  encryptionSalt: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
  isVerified: z.boolean(),
});

export const NoteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  isArchived: z.boolean(),
  isFavorite: z.boolean(),
  encryptionVersion: z.string(),
  contentHash: z.string(),
  deviceId: z.string().optional(),
  syncVersion: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterRequestSchema = AuthRequestSchema.extend({
  encryptionSalt: z.string(),
});

export const CreateNoteRequestSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  deviceId: z.string().optional(),
});

export const UpdateNoteRequestSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  deviceId: z.string().optional(),
});

// Error types
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

// Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
