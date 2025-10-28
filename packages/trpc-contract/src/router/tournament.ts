import { z } from 'zod';
import { createRouter, protectedProcedure, publicProcedure } from '../utils';
import { tournamentNameSchema, tournamentInput } from '../schemas';
import { observable } from '@trpc/server/observable';
import { type TournamentBrackets } from '../types';

export const tournamentRouter = createRouter({
  create: protectedProcedure
    .input(tournamentInput)
    .mutation(async ({ input, ctx }) => {
      return await ctx.services.tournament.createTournament(
        input.name,
        ctx.userToken.id,
        input.playerLimit
      );
    }),

  join: protectedProcedure
    .input(z.object({ name: tournamentNameSchema }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.services.tournament.joinTournament(
        input.name,
        ctx.userToken.id
      );
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    const tournaments = await ctx.services.tournament.listAllTournaments();
    if (tournaments) return tournaments;
    return [];
  }),

  get: protectedProcedure
    .input(z.object({ tournamentId: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const tournaments = await ctx.services.tournament.listAllTournaments();
      if (tournaments) {
        return (
          tournaments.find(
            (t: { id: number }) => t.id === input.tournamentId
          ) || null
        );
      }
      return null;
    }),

  getPlayers: protectedProcedure
    .input(z.object({ name: tournamentNameSchema }))
    .query(async ({ input, ctx }) => {
      const players = await ctx.services.tournament.getTournamentPlayers(
        input.name
      );
      if (!players) {
        throw new Error('No players found for this tournament');
      }
      return players;
    }),

  start: protectedProcedure
    .input(z.object({ name: tournamentNameSchema }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.services.tournament.startTournament(input.name);
    }),

  getBracket: protectedProcedure
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const bracket = await ctx.services.tournament.getTournamentBracket(input.id);
      if (!bracket) {
        throw new Error('No bracket found for this tournament');
      }
      return bracket || null;
    }),

  // endTournament: protectedProcedure
  //   .input(
  //     z.object({ name: tournamentNameSchema, playerId: z.number().positive() })
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     return await ctx.services.tournament.endTournament(
  //       input.name,
  //       input.playerId
  //     );
  //   }),
  subscribeBracket: publicProcedure
    .input(z.object({ id: z.number().positive() }))
    .subscription(({ input, ctx }) => {
      return observable<TournamentBrackets>((emit) => {
        try {
          ctx.services.tournament
            .getTournamentBracket(input.id)
            .then((t) => {
              if (t) {
                emit.next(t);
              }
            })
            .catch((err) => {
              emit.error(err);
            });
        } catch (err) {
          emit.error(err);
        }
        const unsubscribe = ctx.services.tournament.subscribeToBracketUpdates(
          input.id,
          (updatedBracket) => {
            emit.next(updatedBracket);
          }
        );
        return unsubscribe;
      });
    }),
});
