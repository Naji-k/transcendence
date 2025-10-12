import { authenticator } from 'otplib';
import { findUserById, updateUser2FASecret, enableUser2FA, disableUser2FA } from '../db/src/dbFunctions';
import { FastifyInstance } from 'fastify';

export async function setup2FA(userId: number) {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  const secret = authenticator.generateSecret();
  await updateUser2FASecret(userId, secret);
  const otpauth = authenticator.keyuri(user.alias, 'Transcendence', secret);
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
  await disableUser2FA(userId);
  return true;
}

export function setup2FARoutes(app: FastifyInstance) {

  app.post<{ Body: { userId: number } }>(
    '/api/auth/2fa/setup',
    async (req, reply) => {
      const { userId } = req.body;
      if (!userId) return reply.status(400).send({ error: 'Missing userId' });
      const otpauth = await setup2FA(userId);
      return reply.send({ otpauth });
    }
  );

  app.post<{ Body: { userId: number; token: string } }>(
    '/api/auth/2fa/verify',
    async (req, reply) => {
      const { userId, token } = req.body;
      if (!userId || !token) return reply.status(400).send({ ok: false, error: 'Missing userId or token' });
      const ok = await verify2FA(userId, token);
      return reply.send({ ok });
    }
  );
}