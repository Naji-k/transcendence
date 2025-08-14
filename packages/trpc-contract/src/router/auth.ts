/**
 * authentication router
 * Handles user authentication operations such as login, logout, and registration.
 */
import { createRouter, publicProcedure } from "../trpc";
import { signUpInput, loginInput } from "../schemas";
import { LoginResponse, Response, User } from "../types";

export const authRouter = createRouter({
  /**
   * signUp procedure handles user registration.
   * It validates the input and creates a new user in the database.
   */
  signUp: publicProcedure
    .input(signUpInput)
    .mutation(async ({ ctx, input }) => {
      //   const hashedPassword = return a hashed version of input.password
      // const user = await ctx.db.createUser({
      //     name: input.name,
      //     email: input.email,
      //     password: hashedPassword,
      // });
      const user: User = {id : 1, email:input.email, name: input.name}; // Mock user for demonstration
      const token = ctx.jwtUtils.sign("${user.id}", user.email)
      return {
        status: 201,
        message: "User created successfully",
        data: {user, token},
      } as Response<LoginResponse>; // Mock response for demonstration
    }),
  /**
   * login procedure handles user login.
   * It checks if the user exists and if the password is correct.
   * If successful, it generates a JWT token and returns it.
   */
  login: publicProcedure.input(loginInput).mutation(async ({ ctx, input }) => {
    // const user = await ctx.db.findUserByEmail(input.email);
    // const validPassword = await comparePassword(input.password, user.password);

    const user = { id: 2, email: input.email, name: "user_name" }; // Mock user for demonstration
    const validPassword = true; // Mock password check
    if (!user || !validPassword) {
      console.error("Invalid email or password");
      return {
        status: 401,
        message: "Invalid email or password",
      } as Response<LoginResponse>;
    }
    // Generate JWT token
    const auth = ctx.jwtUtils.sign("${user.id}", user.email);
    return {
      status: 200,
      message: "Login successful",
      data: {
        user: user,
        token: auth, // JWT token
      },
    } as Response<LoginResponse>; // Mock response for demonstration
  }),
});
