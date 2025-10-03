import type { AppRouter } from '@repo/trpc';
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
	url: WS_URL,
	connectionParams: async () => {
		const currentToken = getAuthToken();
		return currentToken ? { authorization: `Bearer ${currentToken}` } : {};
	},
	lazy: {
		enabled: true,
		closeMs: 30000,
	}
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
