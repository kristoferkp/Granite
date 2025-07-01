import { decryptNote, encryptNote, generateSalt } from './crypto';
import { supabase } from './supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptedNote {
  id: string;
  userId: string;
  title: string;
  storagePath: string;
  iv: string;
  createdAt: Date;
  updatedAt: Date;
}

class NotesAPI {
  private userPassword: string | null = null;
  private userSalt: string | null = null;

  /**
   * Sets the user's password and salt for encryption/decryption
   */
  setUserCredentials(password: string, salt?: string) {
    this.userPassword = password;
    this.userSalt = salt || generateSalt();
  }

  /**
   * Gets the user's salt (needed for persistence)
   */
  getUserSalt(): string | null {
    return this.userSalt;
  }

  /**
   * Gets the authorization header for API calls
   */
  private async getAuthHeader(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }
    return `Bearer ${session.access_token}`;
  }

  /**
   * Makes an authenticated API call
   */
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const authHeader = await this.getAuthHeader();
    
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API call failed');
    }
    
    return data;
  }

  /**
   * Creates a new encrypted note
   */
  async createNote(title: string, content: string): Promise<Note> {
    if (!this.userPassword || !this.userSalt) {
      throw new Error('User credentials not set. Call setUserCredentials first.');
    }

    // Encrypt the note content
    const encryptedData = await encryptNote(content, this.userPassword, this.userSalt);
    
    // Upload encrypted content to storage
    const fileName = `note_${Date.now()}.json`;
    const { storagePath } = await this.apiCall('/storage', {
      method: 'POST',
      body: JSON.stringify({
        encryptedContent: encryptedData,
        fileName,
      }),
    });

    // Save note metadata to database
    const { note } = await this.apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({
        title,
        storagePath,
        iv: encryptedData.iv,
      }),
    });

    return {
      id: note.id,
      title: note.title,
      content,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    };
  }

  /**
   * Retrieves and decrypts all user notes
   */
  async getAllNotes(): Promise<Note[]> {
    if (!this.userPassword || !this.userSalt) {
      throw new Error('User credentials not set. Call setUserCredentials first.');
    }

    // Get notes metadata from API
    const { notes: notesMetadata } = await this.apiCall('/notes');

    // Decrypt each note
    const notes: Note[] = [];
    for (const metadata of notesMetadata) {
      try {
        const decryptedNote = await this.getDecryptedNote(metadata);
        notes.push(decryptedNote);
      } catch (error) {
        console.error(`Failed to decrypt note ${metadata.id}:`, error);
        // Continue with other notes even if one fails
      }
    }

    return notes;
  }

  /**
   * Retrieves and decrypts a specific note
   */
  async getNote(noteId: string): Promise<Note> {
    if (!this.userPassword || !this.userSalt) {
      throw new Error('User credentials not set. Call setUserCredentials first.');
    }

    // Get note metadata from API
    const { note: metadata } = await this.apiCall(`/notes/${noteId}`);

    return this.getDecryptedNote(metadata);
  }

  /**
   * Updates an existing note
   */
  async updateNote(noteId: string, title?: string, content?: string): Promise<Note> {
    if (!this.userPassword || !this.userSalt) {
      throw new Error('User credentials not set. Call setUserCredentials first.');
    }

    let storagePath: string | undefined;
    let iv: string | undefined;

    // If content is being updated, re-encrypt and upload
    if (content !== undefined) {
      // Encrypt new content
      const encryptedData = await encryptNote(content, this.userPassword, this.userSalt);
      
      // Upload new encrypted content
      const fileName = `note_${Date.now()}.json`;
      const uploadResult = await this.apiCall('/storage', {
        method: 'POST',
        body: JSON.stringify({
          encryptedContent: encryptedData,
          fileName,
        }),
      });

      storagePath = uploadResult.storagePath;
      iv = encryptedData.iv;
    }

    // Update metadata via API
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (storagePath !== undefined) updateData.storagePath = storagePath;
    if (iv !== undefined) updateData.iv = iv;

    const { note: updatedMetadata } = await this.apiCall(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return this.getDecryptedNote(updatedMetadata);
  }

  /**
   * Deletes a note
   */
  async deleteNote(noteId: string): Promise<void> {
    await this.apiCall(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Helper method to decrypt a note from metadata
   */
  private async getDecryptedNote(metadata: EncryptedNote): Promise<Note> {
    // Download encrypted content from storage via API
    const { encryptedContent } = await this.apiCall(`/storage?path=${encodeURIComponent(metadata.storagePath)}`);

    // Decrypt content
    const decryptedContent = await decryptNote(encryptedContent, this.userPassword!, this.userSalt!);

    return {
      id: metadata.id,
      title: metadata.title,
      content: decryptedContent,
      createdAt: new Date(metadata.createdAt),
      updatedAt: new Date(metadata.updatedAt),
    };
  }
}

export const notesAPI = new NotesAPI();
