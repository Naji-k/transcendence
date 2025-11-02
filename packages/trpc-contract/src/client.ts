// client.ts should be separate from server.ts to avoid circular dependencies
// when importing from trpc-contract in frontend

import { appRouter } from './router/main';
export type AppRouter = typeof appRouter;
