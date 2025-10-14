import { authenticator } from 'otplib';
import { findUserById, updateUser2FASecret, enableUser2FA, disableUser2FA } from '../db/src/dbFunctions';
import { FastifyInstance } from 'fastify';
import { jwtUtils } from './jwt';

async function setup2FA(userId: number) {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  const secret = authenticator.generateSecret();
  await updateUser2FASecret(userId, secret);
  const otpauth = authenticator.keyuri(user.alias, 'Transcendence', secret);
  return otpauth;
}

async function verify2FA(userId: number, token: string) {
  const user = await findUserById(userId);
  if (!user || !user.twofa_secret) return false;
  const valid = authenticator.check(token, user.twofa_secret);
  return valid;
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
      if (ok) await enableUser2FA(userId);
      return reply.send({ ok });
    }
  );

  app.post<{ Body: { userId: number } }>(
    '/api/auth/2fa/disable',
    async (req, reply) => {
      const { userId } = req.body;
      if (!userId) return reply.status(400).send({ error: 'Missing userId' });
      await disableUser2FA(userId);
      return reply.send({ ok: true });
    }
  );

  app.post<{ Body: { userId: number; token: string } }>(
    '/api/auth/2fa/verify_login',
    async (req, reply) => {
      const { userId, token } = req.body;
      if (!userId || !token) return reply.status(400).send({ ok: false, error: 'Missing userId or token' });
      const ok = await verify2FA(userId, token);
      if (ok) {
        const user = await findUserById(userId);
        if (!user) return reply.status(400).send({ ok: false, error: 'User not found' });
        const jwt = jwtUtils.sign(user.id, user.email);
        return reply.send({
          ok: true,
          token: jwt,
          user: {
            id: user.id,
            email: user.email,
            name: user.alias,
            twofa_enabled: user.twofa_enabled,
          }
        });
      }
      return reply.send({ ok: false });
    }
  );
}