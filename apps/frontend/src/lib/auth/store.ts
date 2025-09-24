import { browser } from "$app/environment";
import { writable } from "svelte/store";
import type { User } from '@repo/trpc/src/types'
import { trpc, setAuthToken } from "../trpc";

interface UserAuthState {
  user: User | null;
  isAuth: boolean;
}

const initState: UserAuthState = {
  user: null,
  isAuth: false
}

export const userAuthStore = writable<UserAuthState>(initState);

export const authStoreMethods = {
  setUser: (user: User) => {
    userAuthStore.update(state => ({
      ...state,
      user,
      isAuth: true
    }))
  },

  clearUser: () => {
    userAuthStore.update(state => ({
      ...state,
      user: null,
      isAuth: false
    }))
  },

}

export async function initAuthStore(): Promise<void> {
  if (!browser) {
    return;
  }

  try {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      authStoreMethods.clearUser();
      return;
    }

    setAuthToken(authToken);

    const user = await trpc.user.getUser.query();
    if (!user) {
      authStoreMethods.clearUser();
      return;
    }
    authStoreMethods.setUser(user);
  } catch (error) {
    console.error(error);
    localStorage.removeItem('authToken');
    authStoreMethods.clearUser();
  }
}

