<script>
	let user = {
		wins: 10,
		losses: 15  
	}
</script>

<div class= "min-h-screen p-24 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
	<main class="py-2 sm:py-4 md:py-6 lg:py-10 px-4 max-w-[1000px] mx-auto font-['Press_Start_2P'] bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl">
		<!-- Section of info with alias and avatar on the left and wins/losses on the right of the page -->
		<header class="flex justify-between items-center text-gray-300">
			<section class="flex items-center">
				<img class="w-20 h-20 rounded-full mr-4" src="https://thisishollywood.com/cdn/shop/products/2330-2325_1024x1024.jpg?v=1615010563" alt="user_avatar"/>
				<h2 class="text-3xl">{user.alias}</h2>
			</section>
			<section>
				<h2 class="text-3xl pb-2">Stats</h2>
				<dl class="grid grid-cols-2 gap-x-4 gap-y-2">
					<dt class="text-green-400">Wins</dt>
					<dd>user.wins</dd>
					<dt class="text-red-400">Losses</dt>
					<dd>user.losses</dd>
					<dt class="text-cyan-400">Winrate</dt>
					<dd>{user.wins && user.losses ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0}%</dd>
				</dl>
			</section>
		</header>
		
		<!-- Lobbies and Tournaments buttons section - They redirect to the corresponding sections below -->
		<nav>
		<button>Lobbies</button>
		<button>Tournaments</button>
		</nav>

		<!-- Match history section - scrollable -->
		<section>
		<h3 class="text-2xl">Match history</h3>
		</section>

		<!-- Friends list section - scrollable -->
		<section>
		<h3 class="text-2xl">Friends</h3>
		</section>

		<!-- Available lobbies section - Scrollable -->
		<section>
		<h3 class="text-2xl">Lobbies</h3>
		</section>

		<!-- Available tournaments section - Scrollable -->
		<section>
		<h3 class="text-2xl">Tournaments</h3>
		</section>
	</main>
</div>




