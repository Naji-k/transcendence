import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import type { User } from '@repo/trpc/src/types';
import { trpc } from '../trpc';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  twofaPending: boolean;
  pendingUserId: number | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: true,
  twofaPending: false,
  pendingUserId: null,
};

export const authLoaded = writable(false);

export const userAuthStore = writable<AuthState>(initialState);

export const isAuthenticated = derived(
  userAuthStore,
  ($auth) => $auth.token !== null && $auth.user !== null && !$auth.twofaPending
);

export const currentUser = derived(userAuthStore, ($auth) => $auth.user);
export const twofaPending = derived(userAuthStore, ($auth) => $auth.twofaPending);
export const pendingUserId = derived(userAuthStore, ($auth) => $auth.pendingUserId)

export const authStoreMethods = {
  login: (token: string, user: User) => {
    if (browser) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('id', user.id.toString());
    }
    userAuthStore.set({
      token,
      user,
      loading: false,
      twofaPending: false,
      pendingUserId: null,
    });
  },

  setTwofaPending: (userId: number) => {
    userAuthStore.update((state) => ({
      ...state,
      token: null, // not fully authenticated yet
      twofaPending: true,
      pendingUserId: userId,
      loading: false,
  }));
  },

  //logout called only when user clicks logout or token is invalid
  logout: async () => {
    if (browser) {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout fetch failed: ', error);
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('id');
    }
    userAuthStore.set({
      user: null,
      token: null,
      loading: false,
      twofaPending: false,
      pendingUserId: null,
    });
  },
  // this used if the token is already set and we just need to fetch the user
  setUser: (user: User) => {
    userAuthStore.update((state) => ({
      ...state,
      user,
      loading: false,
    }));
  },

  clearUser: () => {
    userAuthStore.update((state) => ({
      ...state,
      user: null,
    }));
  },

  setLoading: (loading: boolean) => {
    userAuthStore.update((state) => ({
      ...state,
      loading,
    }));
  },
};

export async function initAuthStore(): Promise<void> {
  authLoaded.set(false);
  if (!browser) {
    authStoreMethods.setLoading(false);
    authLoaded.set(true);
    return;
  }

  try {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
      authStoreMethods.clearUser();
      localStorage.removeItem('id');
      return;
    }

    userAuthStore.update((state) => ({
      ...state,
      token: savedToken,
      loading: true,
    }));

    const response = await trpc.user.getUser.query();
    if (response.status !== 200 || !response.data) {
      console.error('Failed to fetch user data');
      authStoreMethods.clearUser();
      return;
    }
    authStoreMethods.setUser(response.data);
  } catch (error) {
    console.error(error);
    authStoreMethods.clearUser();
  } finally {
    authLoaded.set(true);
  }
}
