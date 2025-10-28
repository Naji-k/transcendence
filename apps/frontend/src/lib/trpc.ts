import type { AppRouter } from '@repo/trpc/client';
import {
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from '@trpc/client';
import superjson from 'superjson';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/trpc';
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000/trpc';

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

const wsClient = createWSClient({
  url: WS_URL,
  connectionParams: async () => {
    const currentToken = getAuthToken();
    return currentToken ? { authorization: `Bearer ${currentToken}` } : {};
  },
  lazy: {
    enabled: true,
    closeMs: 30000,
  },
});

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({
        client: wsClient,
        transformer: superjson,
      }),
      false: httpBatchLink({
        url: API_URL,
        transformer: superjson,
        async headers() {
          const currentToken = getAuthToken();
          return currentToken
            ? { authorization: `Bearer ${currentToken}` }
            : {};
        },
      }),
    }),
  ],
});
