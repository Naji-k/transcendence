import { and, eq } from 'drizzle-orm';
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
    console.log(error);
    throw error;
  }
}

async function isPlayerInTournament(
  tournamentId: number,
  playerId: number
): Promise<boolean> {
  const [exist] = await db
    .select()
    .from(tournamentPlayersTable)
    .where(
      and(
        eq(tournamentPlayersTable.tournamentId, tournamentId),
        eq(tournamentPlayersTable.playerId, playerId)
      )
    );
  return !!exist;
}

// Get all players in a tournament by tournament ID
function tournamentPlayers(tournamentId: number) {
  return db
    .select()
    .from(tournamentPlayersTable)
    .where(eq(tournamentPlayersTable.tournamentId, tournamentId));
}

async function addPlayerToTournament(tournamentId: number, playerId: number) {
  await db
    .insert(tournamentPlayersTable)
    .values({
      playerId: playerId,
      tournamentId: tournamentId,
    })
    .returning();
}

/**
 * Tournament service class
 * This class contains methods to create, join, list tournaments and get tournament players
 */
export class TournamentService {
  async createTournament(name: string, userId: number, playerLimit: number) {
    try {
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

  /**
   * Join a tournament by name, there is some checks before adding the player to the tournament
   * 1. Check if the tournament exists
   * 2. Check if the tournament is still waiting for players
   * 3. Check if the player is already in the tournament
   * 4. Add the player to the tournament
   * 5. If the tournament is full, update the status to 'ready'
   * @param tournamentName
   * @param playerId
   */
  async joinTournament(tournamentName: string, playerId: number) {
    const [tournament] = await db
      .select()
      .from(tournamentTable)
      .where(eq(tournamentTable.name, tournamentName));

    if (!tournament) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tournament not found',
      });
    }
    const tournamentId = tournament.id;
    console.log('Found tournament ID:', { tournamentId, tournamentName });
    if (tournament.status !== 'waiting') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Tournament already started',
      });
    }
    const isInTournament = await isPlayerInTournament(tournamentId, playerId);
    console.log('Is player in THIS tournament:', isInTournament);
    if (isInTournament) {
      return tournament;
    }
    try {
      await addPlayerToTournament(tournamentId, playerId);
      const players = await tournamentPlayers(tournamentId);
      if (players.length >= tournament.playerLimit) {
        console.log("Tournament is full, updating status to 'ready'");
        await db
          .update(tournamentTable)
          .set({ status: 'ready' })
          .where(eq(tournamentTable.name, tournamentName));
      }
      console.log('Player added to tournament:', { playerId, tournamentId });
      return tournament;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error adding player to tournament',
        cause: error,
      });
    }
  }

  // List all tournaments in the database
  async listAllTournaments() {
    try {
      return await db.select().from(tournamentTable);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tournaments',
        cause: error,
      });
    }
  }

  async getTournamentPlayers(tournamentName: string) {
    const [tournament] = await db
      .select()
      .from(tournamentTable)
      .where(eq(tournamentTable.name, tournamentName));

    if (!tournament) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tournament not found',
      });
    }

    const tournamentId = tournament.id;
    try {
      return await tournamentPlayers(tournamentId);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tournament players',
        cause: error,
      });
    }
  }
}
