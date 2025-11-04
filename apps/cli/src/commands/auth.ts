import { trpc } from '../trpc';
import { setToken, clearToken } from '../config';
import { signUpInput, loginInput } from '@repo/trpc/schemas';

export async function signin(email: string, password: string) {
  try {
    const validInput = loginInput.safeParse({
      email,
      password,
    });
    if (!validInput.success) {
      const messages = validInput.error.issues.map((err) => err.message);
      console.error('login validation failed: ', messages);
      return;
    }
    const res = await trpc.auth.login.mutate({ email, password });
    setToken(res.token);
    console.log(`✅ Logged in as ${res.user.email}`);
  } catch (e) {
    console.error('login failed: ', e.message);
  }
}

export async function signup(name: string, email: string, password: string) {
  try {
    const validInput = signUpInput.safeParse({
      name,
      email,
      password,
      twofa_enabled: 0,
    });
    if (!validInput.success) {
      const messages = validInput.error.issues.map((err) => err.message);
      console.error('signup failed: ', messages);
    }
    const res = await trpc.auth.signUp.mutate(validInput.data);

    console.log(`🎉 Account created: ${res.message}`);
    setToken(res.token);
    console.log(`✅ Logged in as ${res.user.email}`);
  } catch (e) {
    console.error('login failed: ', e.message);
  }
}

export async function signout() {
  try {
    clearToken();
    console.log('✅ Logged out successfully');
  } catch (e) {
    console.error('logout failed: ', e.message);
  }
}
