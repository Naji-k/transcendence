import type { AppRouter } from '@repo/trpc/client';
import {
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from '@trpc/client';
import superjson from 'superjson';

function getBackendUrl() {
  const host = import.meta.env.VITE_BACKEND_HOST ?? 'localhost';
  return `${host}:3000/trpc`;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

const wsClient = createWSClient({
  url: 'ws://' + getBackendUrl(),
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
        url: 'http://' + getBackendUrl(),
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
