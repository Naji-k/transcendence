import type { AppRouter } from '@repo/trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const API_URL = 'http://localhost:3000/trpc';

let token: string = null;

export function setAuthToken(t: string) {
  token = t;
}

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
      async headers() {
        return token ? { authentication: `Bearer ${token}` } : {};
      },
    }),
  ],
});
