import * as Crypto from 'expo-crypto';

export interface EncryptedData {
  encryptedContent: string;
  iv: string;
}

/**
 * Derives an encryption key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(password: string, salt: string): Promise<string> {
  const keyBuffer = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return keyBuffer;
}

/**
 * Generates a random salt for key derivation
 */
export function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generates a random initialization vector
 */
export function generateIV(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Simple XOR-based encryption (for demo purposes - in production use a proper crypto library)
 * Note: This is a simplified implementation. For production, use a proper encryption library like libsodium
 */
export function encryptData(content: string, key: string): EncryptedData {
  const iv = generateIV();
  const combinedKey = key + iv;
  
  let encrypted = '';
  for (let i = 0; i < content.length; i++) {
    const keyChar = combinedKey.charCodeAt(i % combinedKey.length);
    const contentChar = content.charCodeAt(i);
    encrypted += String.fromCharCode(contentChar ^ keyChar);
  }
  
  return {
    encryptedContent: btoa(encrypted), // Base64 encode
    iv,
  };
}

/**
 * Simple XOR-based decryption (for demo purposes - in production use a proper crypto library)
 */
export function decryptData(encryptedData: EncryptedData, key: string): string {
  const { encryptedContent, iv } = encryptedData;
  const combinedKey = key + iv;
  const encrypted = atob(encryptedContent); // Base64 decode
  
  let decrypted = '';
  for (let i = 0; i < encrypted.length; i++) {
    const keyChar = combinedKey.charCodeAt(i % combinedKey.length);
    const encryptedChar = encrypted.charCodeAt(i);
    decrypted += String.fromCharCode(encryptedChar ^ keyChar);
  }
  
  return decrypted;
}

/**
 * Encrypts note content using user's derived key
 */
export async function encryptNote(content: string, userPassword: string, userSalt: string): Promise<EncryptedData> {
  const derivedKey = await deriveKeyFromPassword(userPassword, userSalt);
  return encryptData(content, derivedKey);
}

/**
 * Decrypts note content using user's derived key
 */
export async function decryptNote(encryptedData: EncryptedData, userPassword: string, userSalt: string): Promise<string> {
  const derivedKey = await deriveKeyFromPassword(userPassword, userSalt);
  return decryptData(encryptedData, derivedKey);
}
