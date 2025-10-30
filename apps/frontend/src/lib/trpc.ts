import { browser } from '$app/environment';
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
  if (!browser) {
    const url = import.meta.env.VITE_BACKEND_HOST || 'localhost';
    return `http://${url}/trpc`;
  }
  const url = window !== undefined ? window.location.origin : import.meta.env.VITE_BACKEND_HOST;
  return `${url}/trpc`;

}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// function getWsUrl() {
//   if (!browser) {
//     const url = import.meta.env.VITE_BACKEND_HOST || 'localhost';
//     return `wss://${url}/trpc`;
//   }
//   const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//   const url = window !== undefined ? window.location.host : import.meta.env.VITE_BACKEND_HOST;
//   return `${wsProtocol}//${url}/trpc`;
// }
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

const wsURL = `${wsProtocol}//${window.location.host}/trpc`;

const wsClient = createWSClient({
  url: wsURL,
// connectionParams: async () => {
    // const currentToken = getAuthToken();
    // return currentToken ? { authorization: `Bearer ${currentToken}` } : {};
  // },
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
        url: getBackendUrl(),
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
