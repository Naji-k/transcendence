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

//clean up this function later
function getBackendUrl() {
  // 1️⃣ SSR (Server-Side Rendering) - must use absolute URL
  if (!browser || import.meta.env.DEV) {
    const host = import.meta.env.VITE_BACKEND_HOST ?? 'localhost';
    const url = `http://${host}:4000/trpc`;
    console.log('SSR backend URL:', url);
    return url;
  }

  // 2️⃣ Production (Browser) - use same origin (for Caddy/reverse proxy)
  if (import.meta.env.PROD) {
    const url = `${window.location.origin}/trpc`;
    console.log('Production browser URL:', url);
    return url;
  }

  // 3️⃣ Development (Browser) - use backend host
  const host = import.meta.env.VITE_BACKEND_HOST ?? 'localhost';
  const url = `http://${host}:4000/trpc`;
  console.log('Development browser URL:', url);
  return url;
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
