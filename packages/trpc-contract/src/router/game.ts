import { createRouter, protectedProcedure } from '../trpc';
import { PlayerActionSchema } from '../types/gameState';

export const gameRouter = createRouter({
	sentPlayerAction: protectedProcedure
		.input(PlayerActionSchema)
		.mutation(async ({ ctx, input }) => {
			// Validate the player action input
		}),
		
});

