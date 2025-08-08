import { type Context } from "@repo/trpc/src/types";
import { jwtUtils } from "../auth/jwt"; // Adjust the import path as necessary
import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

const disableJWT = true; //for development,

/**
 * Parses the JWT token from the Authorization header.
 * @param authHeader - The Authorization header from the request.
 * @returns The JWT token if present, otherwise null.
 */
function parseToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * createTRPCContext function to create the context for tRPC.
 * This function is called for each request to set up the context.
 * @param param0 - Fastify context options
 * @param param0.req - Fastify request object
 * @param param0.res - Fastify response object
 * @returns db - Database connection, user - Optional user information
 */
export async function createTRPCContext({
  req,
  res,
}: CreateFastifyContextOptions): Promise<Context> {
  const db = "getDbConnection()"; // Replace with actual DB connection logic ;
  let user = null;
  const token = parseToken(req.headers.authorization);
  if (token && !disableJWT) {
    try {
      user = jwtUtils.verify(token); // Verify the JWT token
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }
  return { db, jwtUtils, user };
}
