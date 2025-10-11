import { authenticator } from 'otplib';
import { findUserById, updateUser2FASecret, enableUser2FA, disableUser2FA } from '../db/src/dbFunctions';

export async function setup2FA(userId: number) {
  const secret = authenticator.generateSecret();
  await updateUser2FASecret(userId, secret);
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  const otpauth = authenticator.keyuri(user.email, 'Transcendence', secret);
  return otpauth;
}

export async function verify2FA(userId: number, token: string) {
  const user = await findUserById(userId);
  if (!user || !user.twofa_secret) return false;
  const valid = authenticator.check(token, user.twofa_secret);
  if (valid) await enableUser2FA(userId);
  return valid;
}

export async function disable2FA(userId: number) {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  await disableUser2FA(userId);
  return true;
}