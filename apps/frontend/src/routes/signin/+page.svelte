<script lang="ts">
  let username = '';
  let password = '';
  import { login } from '$lib/auth/auth';

  function handleSignIn() {
    login(username, password)
      .then((res) => {
        alert(`Login successful! Welcome ${res?.name || ""}`);
      })
      .catch((error) => {
        alert(`Login failed: ${error}`);
      });
  }

  function handleGoogleLogin() {
    alert('Google OAuth flow here');
  }
</script>

<div
  class="flex items-center justify-center min-h-screen font-['Press_Start_2P'] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"
>
  <div
    class="bg-gradient-to-br from-purple-700 to-indigo-900 text-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-8 text-center"
  >
    <h1 class="text-4xl text-cyan-400 drop-shadow-lg">PONG</h1>
    <p class="text-sm tracking-wide">Sign in to start playing</p>

    <!-- Username -->
    <input
      type="text"
      placeholder="Username"
      autocomplete="username"
      bind:value={username}
      class="w-full rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />

    <!-- Password -->
    <input
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      bind:value={password}
      class="w-full rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />

    <!-- Sign In Button -->
    <button
      on:click={handleSignIn}
      class="bg-cyan-500 hover:bg-cyan-600 active:scale-95 shadow-lg active:shadow-inner transition-transform rounded-xl px-6 py-3 font-bold text-black w-full"
    >
      Sign In
    </button>

    <!-- Don't have an account? -->
    <p class="text-xs drop-shadow-md select-none">
      Don't have an account?
      <a
        href="/signup"
        class="!text-cyan-200 hover:text-white font-semibold transition-colors"
      >
        Sign up
      </a>
    </p>

    <!-- Divider -->
    <div
      class="flex items-center justify-center gap-4 text-cyan-300 font-semibold text-sm select-none"
    >
      <div class="h-px w-20 bg-cyan-400"></div>
      OR
      <div class="h-px w-20 bg-cyan-400"></div>
    </div>

    <!-- Google Button -->
    <button
      on:click={handleGoogleLogin}
      class="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:scale-95 active:shadow-inner rounded-xl px-6 py-3 text-black shadow-md transition-transform mx-auto w-full"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        class="w-6 h-6"
      />
      Continue with Google
    </button>

    <!-- Footer -->
    <p class="mt-6 text-xs text-cyan-300 drop-shadow-md select-none">Ping. Pong. Transcend.</p>
  </div>
</div>
