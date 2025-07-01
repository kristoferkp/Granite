import { Note, notesAPI } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user credentials are set in notesAPI
      const userSalt = await AsyncStorage.getItem('userSalt');
      if (userSalt) {
        // Note: In a real app, you'd need to get the password securely
        // This is a simplified implementation
        const userPassword = await AsyncStorage.getItem('userPassword');
        if (userPassword) {
          notesAPI.setUserCredentials(userPassword, userSalt);
        }
      }
      
      const fetchedNotes = await notesAPI.getAllNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string) => {
    try {
      setError(null);
      const newNote = await notesAPI.createNote(title, content);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateNote = async (noteId: string, title?: string, content?: string) => {
    try {
      setError(null);
      const updatedNote = await notesAPI.updateNote(noteId, title, content);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      return updatedNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setError(null);
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshNotes = () => {
    loadNotes();
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
  };
}

export function useNote(noteId: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedNote = await notesAPI.getNote(noteId);
      setNote(fetchedNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  return {
    note,
    loading,
    error,
    refreshNote: loadNote,
  };
}
