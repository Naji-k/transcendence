import type { AppRouter } from '@repo/trpc/client';
import {
  createTRPCProxyClient,
  httpBatchLink,
  TRPCClient,
} from '@trpc/client';
import superjson from 'superjson';
import { readToken } from './config';

function getBackendUrl() {
    const host = process.env.BACKEND_API ?? 'localhost';
    const url = `http://${host}:4000/trpc`;
    console.log('Backend URL:', url);
    return url;
}

export const trpc: TRPCClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getBackendUrl(),
      transformer: superjson,
      async headers() {
        const currentToken = readToken();
        return currentToken ? { authorization: `Bearer ${currentToken}` } : {};
      },
    }),
  ],
});
