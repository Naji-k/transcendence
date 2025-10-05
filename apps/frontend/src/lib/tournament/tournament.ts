import { trpc } from '../trpc';

/**
 * Creates a new tournament with the given name and maximum number of players.
 * @param name
 * @param maxPlayers Maximum number of players (2, 4, or 6)
 * @returns
 */
export async function createTournament(name: string, maxPlayers: number) {
  try {
    const result = await trpc.tournament.create.mutate({
      name: name,
      playerLimit: maxPlayers,
    });
    console.log(`Tournament created: ${JSON.stringify(result)}`);
  } catch (error) {
    alert('Error creating tournament: ' + error.message);
    console.log(`Error creating tournament: ${error.message}`);
  }
  console.log('Creating tournament with name:', name);
}

export async function listTournaments() {
  try {
    const tournaments = await trpc.tournament.list.query();
    console.log(`Tournaments: ${JSON.stringify(tournaments)}`);
  } catch (error) {
    alert('Error listing tournaments: ' + error.message);
  }
}

export async function getPlayersInTournament(tournamentName: string) {
  try {
    const tournamentPlayers = await trpc.tournament.getPlayers.query({
      name: tournamentName,
    });
    console.log(`Players in tournament: ${JSON.stringify(tournamentPlayers)}`);
  } catch (error) {
    alert('Error getting players: ' + error.message);
    console.log(`Error getting players: ${error.message}`);
  }
}

export async function joinTournament(tournamentName: string) {
  try {
    const result = await trpc.tournament.join.mutate({
      name: tournamentName,
    });
    console.log(`Joined tournament: ${JSON.stringify(result)}`);
  } catch (error) {
    alert('Error joining tournament: ' + error.message);
    console.log(`Error joining tournament: ${error.message}`);
  }
}

export async function startTournament(tournamentName: string) {
  try {
    const result = await trpc.tournament.start.mutate({
      name: tournamentName,
    });
    console.log(`Started tournament: ${JSON.stringify(result)}`);
  } catch (error) {
    alert('Error starting tournament: ' + error.message);
    console.log(`Error starting tournament: ${error.message}`);
  }
}
