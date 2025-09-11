import { userRouter, authRouter } from './router';
import { gameRouter } from './router/game';
import { createRouter, publicProcedure } from './trpc';

/**
 * Main application router that combines all individual routers.
 * This is the entry point for all tRPC operations.
 */
export const appRouter = createRouter({
	user: userRouter,
	auth: authRouter,
	game: gameRouter,
	hello: publicProcedure.query(() => {
		return 'Hello, world!';
	}),
});

export type AppRouter = typeof appRouter;
