import { z } from 'zod';
import { createRouter, protectedProcedure, publicProcedure } from '../trpc';

export const tournamentRouter = createRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .regex(/^\S+$/, { message: 'Name must not contain spaces' }),
        playerLimit: z.number().min(2).max(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = 1; //ctx.userToken?.id;
      return await ctx.services.tournament.createTournament(
        input.name,
        userId,
        input.playerLimit
      );
    }),

  join: protectedProcedure
    .input(z.object({ tournamentId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {
      const userId = 1; //ctx.userToken?.id;
      return await ctx.services.tournament.joinTournament(
        input.tournamentId,
        userId
      );
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const tournaments = await ctx.services.tournament.listAllTournaments();
    if (tournaments) return tournaments;
    return [];
  }),

  get: publicProcedure
    .input(z.object({ tournamentId: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const tournaments = await ctx.services.tournament.listAllTournaments();
      if (tournaments) {
        return tournaments.find((t: { id: number }) => t.id === input.tournamentId) || null;
      }
      return null;
    }),
});
