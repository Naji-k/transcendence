import argon2 from 'argon2';

/**
 * Generates a random salt for password hashing.
 * @returns A random salt as a string
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password is required');
  }
  return argon2.hash(password);
}

/**
 * Verifies a password against a hash.
 * @param hash - The hashed password
 * @param password - The plain text password to verify
 * @returns A boolean indicating whether the password matches the hash
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}
