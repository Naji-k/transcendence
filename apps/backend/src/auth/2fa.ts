import { authenticator } from 'otplib';
import { findUserByEmail, updateUser2FASecret, enableUser2FA } from '../db/src/dbFunctions';

export async function setup2FA(email: string) {
  const secret = authenticator.generateSecret();
  await updateUser2FASecret(email, secret);
  const otpauth = authenticator.keyuri(email, 'Transcendence', secret);
  return otpauth;
}

export async function verify2FA(email: string, token: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.twofa_secret) return false;
  const valid = authenticator.check(token, user.twofa_secret);
  if (valid) await enableUser2FA(email);
  return valid;
}