import { goto } from '$app/navigation';
import { trpc } from '$lib/trpc';

export async function visitUser(visitedUserAlias: string) {
  try {
    // Get visited user id
    const visitedUserIdRes = await trpc.user.getVisitedUser.query({ alias: visitedUserAlias });
    if (visitedUserIdRes.status === 200) {
      goto(`/profile/${visitedUserAlias}`, {
        state: { visitedUserId: visitedUserIdRes.data.id }
      });
    }
  } catch (error) {
    if (error.message.includes('Error in fetching visited user')) {
      alert(`${visitedUserAlias} does not exist`);
      console.log(`${visitedUserAlias} does not exist`);
    } else {
      visitedUserAlias = "";
      alert(`Error fetching ${visitedUserAlias}`);
      console.log(`Error fetching ${visitedUserAlias}`);
    }
  } 
}