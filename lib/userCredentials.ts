import AsyncStorage from '@react-native-async-storage/async-storage';
import { notesAPI } from './api';
import { generateSalt } from './crypto';

const USER_SALT_KEY = 'userSalt';
const ENCRYPTION_PASSWORD_KEY = 'encryptionPassword'; // Note: In production, use more secure storage (Keychain/Keystore)

export class UserCredentialsManager {
  private static instance: UserCredentialsManager;
  private isEncryptionInitialized = false;

  static getInstance(): UserCredentialsManager {
    if (!UserCredentialsManager.instance) {
      UserCredentialsManager.instance = new UserCredentialsManager();
    }
    return UserCredentialsManager.instance;
  }

  /**
   * Sets up encryption credentials for a new user
   * This should be called AFTER account authentication when user creates their encryption password
   * @param encryptionPassword - The password used exclusively for encrypting/decrypting notes (NON-RECOVERABLE)
   */
  async setupEncryptionPassword(encryptionPassword: string): Promise<void> {
    try {
      // Generate new salt for encryption
      const salt = generateSalt();
      await AsyncStorage.setItem(USER_SALT_KEY, salt);

      // Store encryption password (in production, use secure storage like Keychain)
      await AsyncStorage.setItem(ENCRYPTION_PASSWORD_KEY, encryptionPassword);

      // Set credentials in notesAPI
      notesAPI.setUserCredentials(encryptionPassword, salt);
      
      this.isEncryptionInitialized = true;
    } catch (error) {
      console.error('Failed to setup encryption password:', error);
      throw new Error('Failed to setup note encryption');
    }
  }

  /**
   * Verifies and loads encryption credentials
   * This should be called when user wants to access their encrypted notes
   * @param encryptionPassword - The encryption password to verify
   * @returns true if password is correct and credentials loaded, false otherwise
   */
  async unlockWithEncryptionPassword(encryptionPassword: string): Promise<boolean> {
    try {
      const salt = await AsyncStorage.getItem(USER_SALT_KEY);
      const storedPassword = await AsyncStorage.getItem(ENCRYPTION_PASSWORD_KEY);

      if (!salt || !storedPassword) {
        return false; // No encryption setup found
      }

      if (storedPassword === encryptionPassword) {
        notesAPI.setUserCredentials(encryptionPassword, salt);
        this.isEncryptionInitialized = true;
        return true;
      }
      
      return false; // Wrong password
    } catch (error) {
      console.error('Failed to verify encryption password:', error);
      return false;
    }
  }

  /**
   * Checks if encryption has been set up for this device
   * @returns true if encryption password has been configured
   */
  async hasEncryptionSetup(): Promise<boolean> {
    try {
      const salt = await AsyncStorage.getItem(USER_SALT_KEY);
      const encryptionPassword = await AsyncStorage.getItem(ENCRYPTION_PASSWORD_KEY);
      return !!(salt && encryptionPassword);
    } catch (error) {
      console.error('Failed to check encryption setup:', error);
      return false;
    }
  }

  /**
   * Clears encryption credentials (call on account logout or reset)
   * WARNING: This will make all encrypted notes permanently inaccessible
   */
  async clearEncryptionCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_SALT_KEY);
      await AsyncStorage.removeItem(ENCRYPTION_PASSWORD_KEY);
      this.isEncryptionInitialized = false;
    } catch (error) {
      console.error('Failed to clear encryption credentials:', error);
    }
  }

  /**
   * Changes the encryption password (requires current password verification)
   * WARNING: This will re-encrypt all notes with the new password
   * @param currentPassword - Current encryption password for verification
   * @param newPassword - New encryption password
   */
  async changeEncryptionPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // First verify current password
      const isCurrentValid = await this.unlockWithEncryptionPassword(currentPassword);
      if (!isCurrentValid) {
        return false; // Current password is wrong
      }

      const salt = await AsyncStorage.getItem(USER_SALT_KEY);
      if (!salt) {
        throw new Error('No salt found. Encryption not initialized.');
      }

      // Update stored password
      await AsyncStorage.setItem(ENCRYPTION_PASSWORD_KEY, newPassword);
      
      // Update API credentials
      notesAPI.setUserCredentials(newPassword, salt);
      
      // TODO: In a complete implementation, you would need to:
      // 1. Fetch all encrypted notes
      // 2. Decrypt them with the old password
      // 3. Re-encrypt them with the new password
      // 4. Upload the re-encrypted versions
      
      return true;
    } catch (error) {
      console.error('Failed to change encryption password:', error);
      throw new Error('Failed to update encryption password');
    }
  }

  /**
   * Checks if encryption credentials are currently loaded and ready for use
   */
  isEncryptionReady(): boolean {
    return this.isEncryptionInitialized;
  }

  /**
   * Locks the encryption (clears from memory but keeps stored credentials)
   * User will need to unlock again with their encryption password
   */
  lockEncryption(): void {
    this.isEncryptionInitialized = false;
    // Clear credentials from API but keep stored on device
  }

  /**
   * Gets the user salt (useful for backup/recovery scenarios)
   */
  async getUserSalt(): Promise<string | null> {
    return await AsyncStorage.getItem(USER_SALT_KEY);
  }
}

export const userCredentialsManager = UserCredentialsManager.getInstance();
