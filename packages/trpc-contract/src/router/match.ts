import { createRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const matchRouter = createRouter({
  create: protectedProcedure
    .input(z.object({ max_players: z.number().min(2).max(6) }))
    .mutation(async ({ input, ctx }) => {
      console.log("calling create match from user: ", ctx.userToken.id);
      return await ctx.services.match.createMultiplayerGame(
        ctx.userToken.id,
        input.max_players
      );
    }),
  //list all available matches
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.services.match.getAvailableMatches();
  }),
  //TODO:here should check first if the game is full
  joinGame: protectedProcedure
    .input(z.object({ matchId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.services.match.joinMultiplayerGame(
        input.matchId,
        ctx.userToken.id
      );
    }),

});
