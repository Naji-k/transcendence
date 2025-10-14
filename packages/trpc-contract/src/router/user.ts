import { TRPCError } from '@trpc/server';
import { createRouter, protectedProcedure } from '../trpc';

/**
 * User router for handling user-related operations.
 * User management (getUser, updateUser, listUsers)
 */
export const userRouter = createRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.services.dbServices.findUserById(ctx.userToken.id);
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    return {
      status: 200,
      message: 'User fetched successfully',
      data: { id: user.id, email: user.email, name: user.name, twofa_enabled: user.twofa_enabled},
    };
  }),
});
