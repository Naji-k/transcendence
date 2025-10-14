<script lang="ts">
  import { goto } from '$app/navigation';
  let email = '';
  let password = '';
  import { login, verify2FAToLogin } from '$lib/auth/auth';
  import { isAuthenticated, currentUser, authStoreMethods } from '$lib/auth/store';
  import { onMount } from 'svelte';

  onMount(() => {
	console.log('isAuthenticated-signin: ', $isAuthenticated);
	if ($isAuthenticated) {
	  console.log('Welcome back!', $currentUser.name);
	  goto('/profile');
	}
  });

  let twofaRequired = false;
  let userId = null;
  let code = '';
  let error = '';

  async function handleSignIn() {
    error = '';
    try {
      const res = await login(email, password);
      twofaRequired = res.twofaRequired;
      userId = res.userId;
    } catch (e) {
      error = e;
    }
  }

//  alert(`Login successful! Welcome ${$currentUser.name}`);
//         goto('/profile');

  async function handle2FAVerify() {
    error = '';
    try {
      await verify2FAToLogin(userId, code);
    } catch (e) {
      error = e;
    }
  }

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:3000/api/auth/google';
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

    <!-- email -->
    <input
      type="text"
      placeholder="email"
      autocomplete="email"
      bind:value={email}
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
    <p class="mt-6 text-xs text-cyan-300 drop-shadow-md select-none">
      Ping. Pong. Transcend.
    </p>
  </div>
</div>

{#if twofaRequired}
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
      <h2 class="text-lg font-semibold text-center">
        Two-Factor Authentication
      </h2>
      <p class="text-center text-sm text-gray-600">
        Please enter the verification code.
      </p>
      {#if error}
        <p class="text-red-500 text-xs text-center">{error}</p>
      {/if}
      <input
        type="text"
        placeholder="Verification code"
        bind:value={code}
        class="w-full rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <button
        on:click={handle2FAVerify}
        class="bg-cyan-500 hover:bg-cyan-600 active:scale-95 shadow-lg active:shadow-inner transition-transform rounded-xl px-6 py-3 font-bold text-black w-full"
      >
        Verify
      </button>
    </div>
  </div>
{/if}
