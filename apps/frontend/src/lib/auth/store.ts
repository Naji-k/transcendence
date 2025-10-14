import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import type { User } from '@repo/trpc/src/types';
import { trpc } from '../trpc';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean; // not sure if needed
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: true,
};

export const authLoaded = writable(false);

export const userAuthStore = writable<AuthState>(initialState);

export const isAuthenticated = derived(
  userAuthStore,
  ($auth) => $auth.token !== null && $auth.user !== null
);

export const currentUser = derived(userAuthStore, ($auth) => $auth.user);

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
    });
  },
  //logout called only when user clicks logout or token is invalid
  logout: () => {
    if (browser) {
      localStorage.removeItem('authToken');
    }
    userAuthStore.set({
      user: null,
      token: null,
      loading: false,
    });
    // authLoaded.set(true);
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
      authStoreMethods.logout();
      return;
    }

    userAuthStore.set({ token: savedToken, user: null, loading: true });

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
