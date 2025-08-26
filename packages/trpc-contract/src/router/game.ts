import { TRPCError } from '@trpc/server';
import { createRouter, protectedProcedure } from '../trpc';
import { PlayerAction, PlayerActionSchema } from '../types/gameState';
import { z } from 'zod';
import { GameState } from '../types/gameState';
import { observable } from '@trpc/server/observable';

export const gameRouter = createRouter({
	initializeMatch: protectedProcedure
		.input(z.object({ matchId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			// Get real players from database
			const players = await ctx.services.dbServices.getMatchPlayers(
				input.matchId
			);
			const gameState = ctx.services.gameStateManager.initGameState(
				input.matchId,
				players
			);
			return { success: true, gameState };
		}),

	/**
	 * Subscription to game state updates.
	 * Clients can subscribe to this to receive real-time updates.
	 * @input { matchId: string } - The ID of the match to subscribe to.
	 * @returns An observable that emits GameState updates.
	 */
	subscribeToGameState: protectedProcedure
		.input(z.object({ matchId: z.string() }))
		.subscription(({ input, ctx }) => {
			return observable<GameState>((emit) => {
				try {
					const gameState = ctx.services.gameStateManager.getGameState(
						input.matchId
					);
					if (gameState) {
						emit.next(gameState);
					}
					const unsubscribe = ctx.services.gameStateManager.subscribe(
						input.matchId,
						(gameState) => {
							emit.next(gameState);
						}
					);
					return unsubscribe;
				} catch (err) {
					emit.error(err);
				}
			});
		}),

	sentPlayerAction: protectedProcedure
		.input(PlayerActionSchema)
		.mutation(async ({ ctx, input }) => {
			// Validate the player action input
			//here should check if the game is exist
			const action: PlayerAction = {
				...input,
				// playerId: ctx.userToken.id,
				playerId: '1', // Temporary hardcoded playerId for testing
			};
			const playerExists = await ctx.services.dbServices.playerExistsInMatch(
				action.matchId,
				action.playerId!
			);
			if (!playerExists) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Player does not exist in this match',
				});
			}
			const matchExists = await ctx.services.dbServices.matchExists(
				input.matchId
			);
			if (!matchExists) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Match does not exist',
				});
			}
			const gameState = ctx.services.gameStateManager.getGameState(
				input.matchId
			);
			if (!gameState) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
			}
			ctx.services.gameStateManager.handlePlayerAction(action);
			return { success: true };
		}),
});
