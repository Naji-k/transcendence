import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "@repo/trpc";
import { createTRPCContext } from "./trpc/context";

// Create a Fastify instance
const fastifyInstance = Fastify({
  logger: true,
});

/**
 * Register the tRPC plugin with Fastify
 * and set the prefix for the tRPC routes.
 * This allows you to access the tRPC endpoints and handle all endpoints there.
 */
fastifyInstance.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext: createTRPCContext },
});

export function buildServer() {
  return fastifyInstance;
}
