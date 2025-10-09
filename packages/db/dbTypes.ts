import {
  tournamentTable,
  usersTable,
  tournamentPlayersTable,
  friendshipsTable,
  matchTable,
} from './dbSchema';

export type ExistingUser = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Tournament = typeof tournamentTable.$inferSelect;
export type TournamentPlayer = typeof tournamentPlayersTable.$inferSelect;
export type Friendship = typeof friendshipsTable.$inferSelect;
export type Match = typeof matchTable.$inferSelect;
