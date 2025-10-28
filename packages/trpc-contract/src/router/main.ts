import { createRouter } from '../utils';
import { userRouter } from './user';
import { authRouter } from './auth';
import { gameRouter } from './game';
import { tournamentRouter } from './tournament';
import { matchRouter } from './match';

/**
 * Main application router that combines all individual routers.
 * This is the entry point for all tRPC operations.
 */
export const appRouter = createRouter({
  user: userRouter,
  auth: authRouter,
  game: gameRouter,
  tournament: tournamentRouter,
  match: matchRouter,
});
