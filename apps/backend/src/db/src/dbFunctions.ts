import { usersTable } from './dbSchema/schema';
import { db } from './dbClientInit'
import { eq } from 'drizzle-orm'

type NewUser = typeof usersTable.$inferInsert;
type ExistingUser = typeof usersTable.$inferSelect;

/**
 * Create and return a user, [createdUser] is destructuring the array returned from returning(),
 * and capturing the first element. It returns because it might be needed to use info from the new entry
 * @param newAlias alias of the new user 
 * @param newEmail email of the new user
 * @param newPassword password of the new user
 * @returns The user data or throws an error
 */
export async function createUser(newAlias: string, newEmail: string, newPassword: string): Promise<NewUser> {
  try {
    const [createdUser] = await db.insert(usersTable).values({
      alias: newAlias,
      email: newEmail,
      password: newPassword,
    }).returning();
    return createdUser;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed query: insert into "users_table"')) {
      console.log('! Failed to store user !');
      console.log(error.message);
    } else {
      console.log('Unknown error');
      console.log(error);
    }
    throw error;
  }
}

export async function findUserById(id: number): Promise<ExistingUser | null> {
  if (!id) {
    throw new Error('findUserById error: id must be provided');
  }

  try {
    // Here we can decide on the selected columns to return
    const [foundUser] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return foundUser ?? null;
  } catch (error) {
    console.log('Unknown error searching for user by id');
    console.log(error);
    throw error;
  }
}

/**
 * Search for an existing user with its alias
 * @param alias alias of existing user
 * @returns The user data or null or throws an error
 */
export async function findUserByAlias(alias: string): Promise<ExistingUser | null> {
  if (!alias) {
    throw new Error('findUserByAlias error: alias must be provided');
  }

  try {
    // Here we can decide on the selected columns to return
    const [foundUser] = await db.select().from(usersTable).where(eq(usersTable.alias, alias));
    return foundUser ?? null;
  } catch (error) {
    console.log('Unknown error searching for user by alias');
    console.log(error);
    throw error;
  }
}

/**
 * Search for an existing user with its alias
 * @param email email of existing user
 * @returns The user data or null or throws an error
 */
export async function findUserByEmail(email: string): Promise<ExistingUser | null> {
  if (!email) {
    throw new Error('findUserByAlias error: email must be provided');
  }

  try {
    // Here we can decide on the selected columns to return
    const [foundUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return foundUser ?? null;
  } catch (error) {
    console.log('Unknown error searching for user by email');
    console.log(error);
    throw error;
  }
}
// Simulated database function to check if a player exists in a match
export function playerExistsInMatch(
	matchId: string,
	playerId: string
): Promise<boolean> {
	// Dummy implementation, replace with actual database query
	return Promise.resolve(true);
}

// Simulated database function to check if a match exists
export function matchExists(matchId: string): Promise<boolean> {
	// Dummy implementation, replace with actual database query
	return Promise.resolve(true);
}

export async function getMatchPlayers(matchId: string): Promise<{ id: string; name: string }[]> {
  // Dummy implementation, replace with actual database query
  return Promise.resolve([
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
  ]);
  
}