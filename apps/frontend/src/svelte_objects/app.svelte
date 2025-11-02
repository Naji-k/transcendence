<script lang="ts">
  import Game from './game.svelte';
  import Editor from './editor.svelte';

  let page: "home" | "game" | "editor" = "home";

  function go(to: "game" | "editor") {
    page = to;
  }

  function goHome() {
    page = "home";
  }
</script>

<style>
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #000;
    color: #ffe97c;
    font-family: sans-serif;
  }
  button {
    margin: 1rem;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #ffe97c;
    color: #222;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }
  button:hover {
    background: #ffdf4c;
  }
  .back {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 10;
    background: #ffe97c;
    color: #222;
    border-radius: 1rem;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
  }
</style>

<div class="center">
  {#if page === "home"}
    <h1>Pong SPA</h1>
    <button onclick={() => go("game")}>Play!</button>
    <button onclick={() => go("editor")}>Editor</button>
  {:else if page === "game"}
    <button class="back" onclick={goHome}>← Back</button>
    <Game />
  {:else if page === "editor"}
    <button class="back" onclick={goHome}>← Back</button>
    <Editor />
  {/if}
</div>