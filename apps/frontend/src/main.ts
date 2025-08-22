// function render()
// {
// 	const app = document.getElementById("app");
// 	if (!app) return;

// 	app.innerHTML = "";

// 	const hash = window.location.hash;

// 	if (hash === "Play game")
// 	{
// 		app.innerHTML = `
// 		<button id="backBtn" style="position:fixed;top:1rem;left:1rem;z-index:10;">← Back</button>
// 		<canvas id="gameCanvas" width="1920" height="1080" style="display:block;margin:0 auto;width:100vw;height:100vh;"></canvas>
// 		`;
// 		import("./game/main.js").then(mod =>
// 		{
// 			mod.startGame(document.getElementById("gameCanvas") as HTMLCanvasElement);
// 		});
// 		document.getElementById("backBtn")?.addEventListener("click", () =>
// 		{
// 			window.location.hash = "";
// 		});
// 	}
// 	else if (hash === "Click here for the map editor")
// 	{
// 		app.innerHTML = `
// 		<button id="backBtn" style="position:fixed;top:1rem;left:1rem;z-index:10;">← Back</button>
// 		<canvas id="gameCanvas" width="1920" height="1080" style="display:block;margin:0 auto;width:100vw;height:100vh;"></canvas>
// 		`;
		
// 		import("./map_editor/main.js").then(mod =>
// 		{
// 			mod.startEditor(document.getElementById("gameCanvas") as HTMLCanvasElement);
// 		});
// 		document.getElementById("backBtn")?.addEventListener("click", () =>
// 		{
// 			window.location.hash = "";
// 		});
// 	}
// 	else
// 	{
// 		app.innerHTML = `
// 		<h1>Welcome to Pong!</h1>
// 		<nav style="display: flex; gap: 2rem; margin: 2rem;">
// 		<a href="#game">Play!</a>
// 		<a href="#editor">Editor</a>
// 		</nav>
// 		`;
// 	}
// }

// window.addEventListener("hashchange", render);
// window.addEventListener("DOMContentLoaded", render);

import app from './svelte_objects/app.svelte';

const app = new App(
{
	target: document.body
});

export default app;