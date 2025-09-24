import { writable } from "svelte/store";
import type { User } from '@repo/trpc/src/types'
import { StateCondition } from "@babylonjs/core";

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
      isAuth: false
    }))
  }
}