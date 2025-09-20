<script lang="ts">
  // no extra logic needed
</script>

<div
  class="flex flex-col items-center justify-center min-h-screen w-full font-['Press_Start_2P'] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-8 text-center"
>
  <!-- Title -->
  <h1 class="text-[14rem] text-cyan-400 drop-shadow-lg mb-10">PONG</h1>

  <!-- Pong Paddle + Ball SVG -->
  <svg
    class="w-40 h-40 drop-shadow-xl mb-12"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Pong paddle and ball"
  >
    <!-- Paddle -->
    <rect
      x="0"
      y="40"
      width="60"
      height="20"
      rx="5"
      ry="5"
      fill="#22d3ee"
      stroke="#7c3aed"
      stroke-width="2"
    />

    <!-- Ball -->
    <circle
      cx="78"
      cy="50"
      r="8"
      fill="#ffffff"
      stroke="#7c3aed"
      stroke-width="1.5"
    />

    <!-- Motion trail -->
    <line
      x1="50"
      y1="50"
      x2="70"
      y2="50"
      stroke="#ffffff"
      stroke-width="1.2"
      stroke-dasharray="4 2"
      opacity="0.7"
    />

    <!-- Inner paddle detail -->
    <rect
      x="5"
      y="45"
      width="50"
      height="10"
      rx="3"
      ry="3"
      fill="none"
      stroke="#ffffff"
      stroke-width="1"
      opacity="0.5"
    />
  </svg>

  <!-- Navigation links -->
  <nav class="flex flex-col space-y-6 w-full max-w-xs mb-10">
    <a
      href="/signin"
      class="block bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 rounded-xl py-4 px-8 text-black font-bold text-center shadow-md transition-colors"
      >Start</a
    >
    <a
      href="./game"
      class="block bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 rounded-xl py-4 px-8 text-black font-bold text-center shadow-md transition-colors"
      >Play Pongers</a
    >
    <a
      href="./map_editor"
      class="block bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 rounded-xl py-4 px-8 text-black font-bold text-center shadow-md transition-colors"
      >Edit Pongers</a
    >
  </nav>

  <!-- Footer -->
  <p class="text-xs text-cyan-300 drop-shadow-md select-none">
    Ping. Pong. Transcend.
  </p>
</div>
