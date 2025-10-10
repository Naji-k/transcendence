<script lang="ts">
	/**
	 * TODO: Discuss with team, what should we present in this profile page?
	 * Ideas:
	 * - Match history
	 * - Friends list
	 * - Tournaments history?
	 * - Lobbies created/joined?
	 * - Create new lobby/tournament button? 
	 * 
	*/
	import { goto } from "$app/navigation";
	import { testUsers, testLobbies, testTournaments, getUserStats, getUserFriends, getUserMatchHistory, getCreator } from "$lib/profileTestData";
	import { authStoreMethods, userAuthStore } from "$lib/auth/store";
	import { onMount } from "svelte";

	// let { user: activeUser, isAuth: activeUserIsAuth } = $derived($userAuthStore);

	// onMount(() => {
	// 	if (activeUserIsAuth == false) {
	// 		goto('/signin');
	// 	}
	// });

	// $inspect(activeUser.name);

	let currentUserIndex = $state(0);
	let currentUser =$derived(testUsers[currentUserIndex]);
	let userStat = $derived(getUserStats(currentUser.id));
	let userFriends = $derived(getUserFriends(currentUser.id));
	let userMatchHistory = $derived(getUserMatchHistory(currentUser.id));
	// console.log("wins: ", userStat.wins, "losses: ", userStat.losses)
	// console.log("friends: ", userFriends);
	// console.log("match history: ", userMatchHistory);
	// console.log("test lobbies: ", testLobbies);


	let user = $derived({
		...currentUser,
		wins: userStat.wins,
		losses: userStat.losses  
	})

	function formatDate(date) {
		return date.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	}
	/**
	 * Generate a string representing the players in a match.
	 * ex: "Player1 vs Player2 vs Player3"
	 * would be used in the match history section (1vs1, or multi)
	 * @param match
	 */
	function playersString(match) {
		if (match.opponent && Array.isArray(match.opponent) && match.opponent.length > 0) {
			const me = user.alias;
			const others = match.opponent.map(o => o.alias ?? o.user?.alias ?? 'Unknown');
			return [me, ...others].join(' vs ');
		}
		return `Match #${match.id}`;
	}

</script>

<div id="page_top" class="flex flex-col sm:p-8 md:p-12 lg:p-24 2xl:flex-row space-y-4 md:space-y-0 xl:space-x-0 2xl:space-x-16 justify-between min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
	<main class="flex-1 py-2 sm:py-4 md:py-6 lg:py-10 px-4 font-['Press_Start_2P'] bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl relative">
		<select bind:value={currentUserIndex} class="absolute top-4 left-4 bg-gray-700 text-white px-3 py-2 rounded">
			{#each testUsers as testUser, index}
				<option value={index}>{testUser.alias}</option>
			{/each}
		</select>
		<!-- Section of info with alias and avatar on the left and wins/losses on the right of the page -->
		<header class="flex flex-col md:flex-row justify-between items-center text-gray-300">
			<section class="flex items-center">
				<img class="w-20 h-20 rounded-full mr-4" src={user.avatarPath} alt="{user.alias} avatar"/>
				<h2 class="sm:text-base md:text-xl lg:text-3xl">{user.alias}</h2>
			</section>
			<section>
				<h2 class="sm:text-base md:text-xl lg:text-3xl pb-2 text-cyan-400">Stats</h2>
				<dl class="sm:text-sm md:text-base lg:text-xl grid grid-cols-2 gap-x-4 gap-y-2">
					<dt class="text-green-400">Wins</dt>
					<dd>{user.wins}</dd>
					<dt class="text-red-400">Losses</dt>
					<dd>{user.losses}</dd>
					<dt class="text-cyan-400">Win rate</dt>
					<dd>{user.wins && user.losses ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0}%</dd>
				</dl>
			</section>
		</header>
		
		<!-- Lobbies and Tournaments buttons section - They redirect to the corresponding sections below -->
		<nav class="text-xs sm:text-sm md:text-md lg:text-lg my-6">
			<button onclick={() => scrollToSection('lobbies')} class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 rounded mr-4 text-black font-bold text-sm shadow-lg">
				Lobbies
			</button>
			<button onclick={() => scrollToSection('tournaments')} class="px-4 py-2 bg-purple-500 hover:bg-purple-600 active:scale-95 rounded text-white font-bold text-sm shadow-lg">
				Tournaments
			</button>

		</nav>

		<!-- Match history section - scrollable -->
        <section class="mt-8">
			<div class="px-6 py-4 border-b-2 border-cyan-400/30 flex justify-between items-center mb-4 rounded-t-2xl">
			<h3 class="sm:text-sm md:text-lg lg:text-2xl mb-4 text-cyan-400">Match history ({userMatchHistory.length})</h3>
			</div>
            <!-- <div class="max-h-128 overflow-y-auto divide-y divide-cyan-400/10"> -->
			<div class="max-h-128 overflow-y-auto space-y-2 divide-cyan-400/10">

                {#each userMatchHistory as match}
				<article class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
    			  <div class="min-w-0">
    			    <p class="text-gray-300 text-xs font-semibold truncate">{playersString(match)}</p>
    			    <time class="text-cyan-200 text-xs block mt-1">{formatDate(match.date)}</time>
    			  </div>
    			  <div class="text-right ml-4 w-28 flex-shrink-0">
    			    <span class="{match.isWin ? 'text-green-400' : 'text-red-400'} font-semibold mr-2 block ">
    			      {match.isWin ? 'WIN' : 'LOSS'}
    			    </span>
    			    <small class="text-cyan-200 text-xs block mt-1 mr-2">#{match.placement}</small>
    			  </div>
    			</article>
                {/each}
                {#if userMatchHistory.length === 0}
                    <p class="text-cyan-200 text-center py-4">No matches played yet</p>
                {/if}
            </div>
        </section>

		<!-- Friends list section - scrollable -->
		<section class="mt-6">
			<h3 class="sm:text-sm md:text-lg lg:text-2xl mb-4 text-cyan-400">Friends ({userFriends.length})</h3>
			<div class="max-h-128 overflow-y-auto space-y-2 divide-cyan-400/10">
				{#each userFriends as friend}
				<article class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
						<div class="ml-2">
							<p class="text-gray-300 text-xs font-semibold truncate">{friend.alias}</p>
						</div>
					</article>
				{/each}
				{#if userFriends.length === 0}
					<p class="text-cyan-200 text-center py-4">No friends yet</p>
				{/if}
			</div>
		</section>

	</main>
	<main class="flex-1 py-2 sm:py-4 md:py-6 lg:py-10 px-4 md:my-16 xl:my-16 2xl:my-0 font-['Press_Start_2P'] bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl relative">

		<!-- Available lobbies section - Scrollable -->
		<section id="lobbies" class="mt-6">
			<div class="px-6 py-4 border-b-2 border-cyan-400/30 flex justify-between items-center mb-4 rounded-t-2xl">
				<h3 class="sm:text-sm md:text-lg lg:text-2xl mb-0 text-cyan-400 font-bold tracking-wide">MATCH LOBBIES</h3>
				<button onclick={() => goto('/game_lobby')} class="text-xs sm:text-sm md:text-md lg:text-lg bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded mr-1 mb-2 text-black font-bold shadow-lg">
					 Create match
				</button>
			</div>

			<div class="max-h-128 overflow-y-auto space-y-2 divide-cyan-400/10">
				{#each testLobbies as lobby}
					<article class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
						<div class="flex items-center">
							<img class="w-12 h-12 rounded-full mr-3" src={getCreator(lobby.creator).avatarPath} alt="{getCreator(lobby.creator).alias} avatar">
							<p class="text-left text-gray-300 text-xs font-semibold mr-3">{getCreator(lobby.creator).alias}'s game</p>
						</div>
						<p class="text-right text-gray-300 text-xs mr-3">{lobby.players.length}/{lobby.mode * 2} players</p>
					</article>
				{/each}
			</div>
		</section>
	
		<!-- Available tournaments section - Scrollable -->
		 <!-- TODO: update tournament_lobby link -->
		<section id="tournaments" class="mt-6">
			<div class="px-6 py-4 border-b-2 border-cyan-400/30 flex justify-between items-center mb-2 rounded-t-2xl">
				<h3 class="sm:text-sm md:text-lg lg:text-2xl mb-0 text-cyan-400 font-bold tracking-wide">TOURNAMENTS</h3>
				<button onclick={() => goto('/tournament_lobby')} class="text-xs sm:text-sm md:text-md lg:text-lg bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded mr-1 mb-2 text-white font-bold shadow-lg">
					 Create tournament
				</button>
			</div>
			<div class="max-h-128 overflow-y-auto space-y-2 divide-cyan-400/10">
				{#each testTournaments as tournament}
					<article class="grid grid-cols-[auto_1fr_1fr_1fr] gap-3 items-center bg-gray-800 p-3 rounded-lg">
						<img class="w-8 h-8 sm:w-12 sm:h-12 rounded-full" src={getCreator(tournament.creator).avatarPath} alt="{getCreator(tournament.creator).alias} avatar">
						<p class="text-left text-gray-300 text-xs  min-w-0 truncate">{tournament.name}</p>
						<p class="text-center text-gray-300 text-xs ">{tournament.players.length}/{tournament.playerLimit} players</p>
						<p class="text-right text-gray-300 text-xs  mr-3">{tournament.status}</p>
					</article>
				{/each}
			</div>
		</section>
	
		<div class="text-sm md:text-md lg:text-lg mt-6 flex justify-center">
			<button onclick={() => scrollToSection('page_top')} class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 rounded text-black font-bold shadow-lg">
				back to top
			</button>
		</div>
	</main>
</div>
