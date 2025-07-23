import { initTRPC } from "@trpc/server";
import { Context } from "./context";

// Initialize tRPC with the context type
const t = initTRPC.context<Context>().create();

export const createRouter = t.router;
export const publicProcedure = t.procedure;
