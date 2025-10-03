import { and, count, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../db/src/dbClientInit';
import { matchTable, singleMatchPlayersTable } from '../db/src/dbSchema/schema';
import { TRPCError } from '@trpc/server';

export class MatchService {
  async createMultiplayerGame(playerId: number, maxPlayers: number) {
    // Logic to create a match in the database
    const [match] = await db
      .insert(matchTable)
      .values({
        tournamentId: null,
        maxPlayers: maxPlayers,
        victor: null,
      })
      .returning();

    // add first player
    await db.insert(singleMatchPlayersTable).values({
      matchId: match.id,
      playerId: playerId,
      placement: 0,
    });
    return match;
  }

  async joinMultiplayerGame(matchId: number, playerId: number) {
    const [match] = await db
      .select()
      .from(matchTable)
      .where(eq(matchTable.id, matchId));
    if (!match || match.victor) throw new Error('Match not found joining');

    await db.insert(singleMatchPlayersTable).values({
      matchId: matchId,
      playerId: playerId,
      placement: 0,
    });
    return match;
  }

  async getAvailableMatches() {
    try {
      const matches = await db
        .select({
          id: matchTable.id,
          maxPlayers: matchTable.maxPlayers,
          victor: matchTable.victor,
          date: matchTable.date,
          playerCount: count(singleMatchPlayersTable.id).as('playerCount'),
        })
        .from(matchTable)
        .leftJoin(
          singleMatchPlayersTable,
          eq(matchTable.id, singleMatchPlayersTable.matchId)
        )
        .where(isNull(matchTable.victor))
        .groupBy(matchTable.id);

      return matches.map((match) => ({
        id: match.id,
        playerCount: match.playerCount,
        maxPlayers: match.maxPlayers,
        status: 'waiting',
      }));
    } catch (error) {
      console.error('error getting matches:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'error getting available matches',
      });
    }
  }

}
