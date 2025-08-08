import { initTRPC } from "@trpc/server";
import { Context } from "./types";

// Initialize tRPC with the context type
const t = initTRPC.context<Context>().create();

export const createRouter = t.router;
export const publicProcedure = t.procedure;
