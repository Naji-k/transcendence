import { usersTable } from './dbSchema/schema';
import { db } from './dbClientInit'

/* Create and return a user, [createdUser] is destructuring the array returned from returning(),
and capturing the first element. It returns because it might be needed to use info from the new entry */
type NewUser = typeof usersTable.$inferInsert;
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
