import { MatchHistoryEntry } from '@repo/db';
import { trpc } from '../trpc';

export async function showMatches() {
  let userMatchHistory: MatchHistoryEntry[] = [];
  try {

      const res = await trpc.user.getUserMatchHistory.query();
      console.log('**Match History**');
      if (res.status === 200) {
          userMatchHistory = res.data;
          console.log(userMatchHistory);
        } else {
            console.log('No match history found.');
        }
    } catch (e) {
      console.error('Failed to fetch match history:', e.message);
    }
}
