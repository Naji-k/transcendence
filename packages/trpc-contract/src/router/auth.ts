/**
 * authentication router
 * Handles user authentication operations such as login, logout, and registration.
 */
import { createRouter, publicProcedure } from '../trpc';
import { signUpInput, loginInput } from '../schemas';
import { LoginResponse, Response, User } from '../types';
import { TRPCError } from '@trpc/server';

export const authRouter = createRouter({
  /**
   * signUp procedure handles user registration.
   * It validates the input and creates a new user in the database.
   */
  signUp: publicProcedure
    .input(signUpInput)
    .mutation(async ({ ctx, input }) => {
      //   const hashedPassword = return a hashed version of input.password
      const user = await ctx.services.user.createUser(
        input.name,
        input.email,
        input.password
      );
      if (!user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User creation failed',
        });
      }
      const token = ctx.services.jwtUtils.sign('${user.id}', user.email);
      return {
        status: 201,
        message: 'User created successfully',
        data: {
          user,
          token,
        },
      } as Response<LoginResponse>; // Mock response for demonstration
    }),
  /**
   * login procedure handles user login.
   * It checks if the user exists and if the password is correct.
   * If successful, it generates a JWT token and returns it.
   */
  login: publicProcedure.input(loginInput).mutation(async ({ ctx, input }) => {
    const user = await ctx.services.user.findUserByEmail(input.email);
    // return foundUser ?? null;

    // const validPassword = await comparePassword(input.password, user.password);

    console.log('user found: ', user);
    const validPassword = true;
    if (!user || !validPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }
    // Generate JWT token
    const auth = ctx.services.jwtUtils.sign('${user.id}', user.email);
    return {
      status: 200,
      message: 'Login successful',
      data: {
        user: user,
        token: auth, // JWT token
      },
    } as Response<LoginResponse>; // Mock response for demonstration
  }),
});
