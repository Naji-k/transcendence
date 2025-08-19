import { loginInput, signUpInput } from '@repo/trpc/src/schemas';
import { trpc, setAuthToken } from '../trpc';
import { ZodError } from 'zod';

export async function signUp(name: string, email: string, password: string) {
  try {
    const validInput = signUpInput.safeParse({
      name,
      email,
      password,
    });
    if (!validInput.success) {
      const messages = validInput.error.issues.map((err) => err.message);
      console.log('signup failed: ', messages);
      throw messages;
    }
    const res = await trpc.auth.signUp.mutate(validInput.data);
    console.log('signed up: ', res.data);
    return res.data;
  } catch (e) {
    console.error('signup failed ', e);
    throw e;
  }
}

export async function login(email: string, password: string) {
  try {
    const validInput = loginInput.safeParse({
      email,
      password,
    });
    if (!validInput.success) {
      const messages = validInput.error.issues.map((err) => err.message);
      console.log('login failed: ', messages);
      throw messages;
    }
    const res = await trpc.auth.login.mutate(validInput.data);
    if (res.status == 200) {
      setAuthToken(res.data.token);
      console.log('logged in :', res.data);
      return res.data.user;
    } else {
    }
  } catch (e) {
    console.error('login failed: ', e);
    throw e;
  }
}
