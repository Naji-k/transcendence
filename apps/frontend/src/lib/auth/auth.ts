import { loginInput, signUpInput } from '@repo/trpc/src/schemas';
import { trpc } from '../trpc';
import { authStoreMethods } from '$lib/auth/store';
import { goto } from '$app/navigation';

export async function signUp(name: string, email: string, password: string) {
  try {
    const validInput = signUpInput.safeParse({
      name,
      email,
      password,
    });
    if (!validInput.success) {
      const messages = validInput.error.issues.map((err) => err.message);
      console.error('signup failed: ', messages);
      throw messages;
    }
    const res = await trpc.auth.signUp.mutate(validInput.data);
    console.log('logged in :', res.user);
    authStoreMethods.login(res.token, res.user);
    await goto('/profile');
  } catch (e) {
    console.error('signup failed ', e.message || e);
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
      console.error('login validation failed: ', messages);
      throw messages;
    }
    const res = await trpc.auth.login.mutate(validInput.data);
    console.log('logged in :', res.user);
    authStoreMethods.login(res.token, res.user);
    await goto('/profile');
  } catch (e) {
    console.error('login failed: ', e);
    throw e.message || e;
  }
}

export function logout() {
  authStoreMethods.logout();
  goto('/login');
}
