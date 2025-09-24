import { loginInput, signUpInput } from '@repo/trpc/src/schemas';
import { trpc, setAuthToken } from '../trpc';
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
    console.error('signed up: ', res.user);
    setAuthToken(res.token);
    console.log('logged in :', res.user);
		// authStoreMethods.setUser(res.user);
    await goto('/profile');
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
      console.error('login validation failed: ', messages);
      throw messages;
    }
    const res = await trpc.auth.login.mutate(validInput.data);
    // if (res.status !== 200) {
    //   console.error('login failed: ', res);
    //   throw res.message;
    // }
    setAuthToken(res.token);
    localStorage.setItem('id', res.user.id.toString());
    console.log('logged in :', res.user);
    // authStoreMethods.setUser(res.user);
    await goto('/profile');
  } catch (e) {
    console.error('login failed: ', e);
    throw e.message || e;
  }
}
