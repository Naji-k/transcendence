<!-- <div class="flex items-center sm:p-8 md:p-12 lg:p-24 2xl:flex-row space-y-4 md:space-y-0 xl:space-x-0 2xl:space-x-16 justify-between min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
	<main class="flex-1 max-w-[1000px] py-2 sm:py-4 md:py-6 lg:py-10 px-4 font-['Press_Start_2P'] bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl relative">

	</main>
</div> -->

<script lang="ts">
	import { testUsers } from "$lib/profileTestData";

	let maps = [
		"standard",
		"tragedy",
		"transcendence"
	]
</script>

<div id="page_top" class="flex flex-col sm:p-8 md:p-12 lg:p-24 2xl:flex-row space-y-4 md:space-y-0 xl:space-x-0 2xl:space-x-16 justify-between min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
	<main class="flex-1 max-h-[500px] py-2 sm:py-4 md:py-6 lg:py-10 px-4 font-['Press_Start_2P'] bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl relative">
		<h3 class="sm:text-sm md:text-lg lg:text-2xl mb-4 text-amber-300">Match settings</h3>
		<section class="mt-6">
			<!-- No. of players -->
			<article class="flex items-center mb-6">
				<p class="text-gray-300 mr-3">Number of players: </p>
				<div class="flex gap-2">
					{#each [2, 4, 6] as playerNumber}
						<button class="w-10 h-10 bg-gray-300 hover:bg-gray-400 rounded ">
							{playerNumber}
						</button>
					{/each}
				</div>
			</article>
			<!-- Map selection -->
			<article class="flex items-center mb-6">
				<p class="text-gray-300 mr-3">Map: </p>
				<select class="bg-gray-300 text-black px-3 py-2 rounded">
				{#each maps as map}
					<option>{map}</option>
				{/each}
				</select>
			<!-- Invite players -->
			</article>
			<article class="mb-6">
				<form>
					<label for="player_invite" class="text-gray-300"><b>Invite: </b></label>
					<input type="text"  id="player_invite" placeholder="Implement this?" class="bg-gray-300 text-black px-3 py-2 rounded">

				</form>
			</article>

		</section>
		<div class="flex justify-center mt-30">
			<button class="text-xs sm:text-sm md:text-md lg:text-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
				+ Create
			</button>
		</div>
		
	</main>
	<main class="flex-1 py-2 sm:py-4 md:py-6 lg:py-10 px-4 md:my-16 xl:my-16 2xl:my-0 font-['Press_Start_2P'] bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl relative">
		<!-- Available lobbies section - Scrollable -->
		<h3 class="sm:text-sm md:text-lg lg:text-2xl mb-4 text-amber-300">Players</h3>
		<section class="mt-6">
			<div class="max-h-128 overflow-y-auto space-y-2">
				{#each testUsers as user}
					<article class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
						<div class="flex items-center">
							<img class="w-12 h-12 rounded-full mr-3" src="{user.avatarPath}" alt="{user.alias}'s avatar">
							<p class="text-left text-gray-300 text-sm mr-3">{user.alias}</p>
						</div>
					</article>
				{/each}
			</div>
		</section>
		<div class="flex justify-center mt-50">
			<button class="text-xs sm:text-md md:text-lg lg:text-xl bg-green-600 hover:bg-green-700 px-6 py-4 rounded text-white">
				Start
			</button>
		</div>
	</main>
</div>