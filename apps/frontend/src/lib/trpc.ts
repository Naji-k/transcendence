import type { AppRouter } from '@repo/trpc';
import {
	createTRPCProxyClient,
	createWSClient,
	httpBatchLink,
	splitLink,
	wsLink,
} from '@trpc/client';
import superjson from 'superjson';

const API_URL = 'http://localhost:3000/trpc';

let token: string | null = null;

// Initialize token from localStorage on module load
if (typeof window !== 'undefined') {
	token = localStorage.getItem('authToken');
}

export function setAuthToken(t?: string) {
	token = t;
	if (typeof window !== 'undefined') {
		if (t) {
			localStorage.setItem('authToken', t);
		} else {
			localStorage.removeItem('authToken');
		}
	}
}

export function getAuthToken(): string | null {
	return token;
}

const wsClient = createWSClient({
	url: 'ws://localhost:3000/trpc',
	connectionParams: () => {
		const currentToken = getAuthToken();
		return currentToken ? { authorization: `Bearer ${currentToken}` } : {};
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
