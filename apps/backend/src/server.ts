import Fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from '@repo/trpc/router';
import { createTRPCContext } from './trpc';
import websocket from '@fastify/websocket';
import { setupGoogleAuthRoutes, setup2FARoutes, logoutRoute } from './auth';
import pino from 'pino';
import cookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';

// Create a Fastify instance
const fastifyInstance = Fastify({
  disableRequestLogging: true,
  logger: {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
});

fastifyInstance.register(cookie);

/**
 * Register the tRPC plugin with Fastify
 * and set the prefix for the tRPC routes.
 * This allows you to access the tRPC endpoints and handle all endpoints there.
 */
fastifyInstance.register(websocket);

fastifyInstance.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  useWSS: true,
  keepAlive: {
    enabled: true,
    pingMs: 30000,
    pongWaitMs: 5000,
  },
  trpcOptions: { router: appRouter, createContext: createTRPCContext },
});

fastifyInstance.register(fastifyCors, {
  origin: true,
  credentials: true,
});

setupGoogleAuthRoutes(fastifyInstance);
setup2FARoutes(fastifyInstance);
logoutRoute(fastifyInstance);

export function buildServer() {
  return fastifyInstance;
}
