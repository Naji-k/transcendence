import { createRouter, publicProcedure } from "../trpc";

/**
 * User router for handling user-related operations.
 * User management (getUser, updateUser, listUsers)
 */
export const userRouter = createRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    // Example: Return user information from context
    if (!ctx.user) {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }
    //valid token, fetch user info from db and return it
    return {
      status: 200,
      message: "User retrieved successfully",
      data: ctx.user,
    };
  }),
});
