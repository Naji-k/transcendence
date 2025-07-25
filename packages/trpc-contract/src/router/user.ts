import { createRouter, publicProcedure } from "../trpc";

/**
 * User router for handling user-related operations.
 * User management (getUser, updateUser, listUsers)
 */
export const userRouter = createRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    // Example: Return user information from context
    return ctx.user || null;
  }),
});
