import { eq } from 'drizzle-orm';
import { db } from '../db/src/dbClientInit';
import {
  tournamentPlayersTable,
  tournamentTable,
} from '../db/src/dbSchema/schema';
import { TRPCError } from '@trpc/server';

async function insertTournament(
  name: string,
  ownerId: number,
  playerLimit: number
) {
  try {
    const [tournament] = await db
      .insert(tournamentTable)
      .values({
        creator: ownerId,
        name: name,
        playerLimit: playerLimit,
        status: 'waiting',
      })
      .returning();
    return tournament;
  } catch (error) {
    console.log('Error inserting tournament:');
    console.log(error);
    throw error;
  }
}

async function isPlayerInTournament(playerId: number, tournamentId: number) {
  const [exist] = await db
    .select()
    .from(tournamentPlayersTable)
    .where(
      (eq(tournamentPlayersTable.tournamentId, tournamentId),
      eq(tournamentPlayersTable.playerId, playerId))
    );
  return !!exist;
}

async function addPlayerToTournament(playerId: number, tournamentId: number) {
  await db
    .insert(tournamentPlayersTable)
    .values({
      playerId: playerId,
      tournamentId: tournamentId,
    })
    .returning();
}

async function getTournamentPlayers(tournamentId: number) {
  const players = await db
    .select()
    .from(tournamentPlayersTable)
    .where(eq(tournamentPlayersTable.tournamentId, tournamentId));
  return players;
}

export class TournamentService {
  async createTournament(name: string, userId: number, playerLimit: number) {
    try {
      console.log('Creating tournament:', { name, userId, playerLimit });
      const tournament = await insertTournament(name, userId, playerLimit);
      console.log('Tournament created:', tournament);
      return tournament;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create tournament',
        cause: error,
      });
    }
  }

  async joinTournament(tournamentId: number, playerId: number) {
    const [tournament] = await db
      .select()
      .from(tournamentTable)
      .where(eq(tournamentTable.id, tournamentId));

    if (!tournament) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tournament not found',
      });
    }

    if (tournament.status !== 'waiting') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Tournament already started',
      });
    }
    const isInTournament = await isPlayerInTournament(playerId, tournamentId);
    if (isInTournament) {
      return tournament; // Player already in tournament, no action needed
    }
    try {
      await addPlayerToTournament(playerId, tournamentId);
      const players = await getTournamentPlayers(tournamentId);
      if (players.length >= tournament.playerLimit) {
        await db
          .update(tournamentTable)
          .set({ status: 'ready' })
          .where(eq(tournamentTable.id, tournamentId));
      }
      return tournament;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error adding player to tournament',
        cause: error,
      });
    }
  }

  async listAllTournaments() {
    try {
      const tournaments = await db.select().from(tournamentTable);
      return tournaments;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tournaments',
        cause: error,
      });
    }
  }
}
