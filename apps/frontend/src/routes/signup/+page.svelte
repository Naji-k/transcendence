<script lang="ts">
  let username = '';
  let email = '';
  let password = '';
  import { signUp } from '$lib/auth/auth';
  import { isAuthenticated, currentUser, authStoreMethods } from '$lib/auth/store';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';


  onMount(() => {
	console.log('isAuthenticated-signup: ', $isAuthenticated);
	if ($isAuthenticated) {
	  console.log('Welcome back!', $currentUser.name);
	  goto('/profile');
	}
  });

  function handleSignUp() {
    signUp(username, email, password)
      .then((res) => {
		console.log('Response:\n', res);
        alert(`Login successful! Welcome ${$currentUser.name}`);
      })
      .catch((error) => {
        alert(`Signup failed:\n ${error}`);
      });
  }
  //Change the URL to your backend server address?
  function handleGoogleSignUp() {
    window.location.href = '/api/auth/google';
  }
</script>

<div
  class="flex items-center justify-center min-h-screen font-['Press_Start_2P'] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"
>
  <div
    class="bg-gradient-to-br from-purple-700 to-indigo-900 text-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-8 text-center"
  >
    <h1 class="text-4xl text-cyan-400 drop-shadow-lg">PONG</h1>
    <p class="text-sm tracking-wide">Sign up to start playing</p>

    <!-- Username -->
    <input
      type="text"
      placeholder="Username"
      autocomplete="username"
      bind:value={username}
      class="w-full rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />

    <!-- Email -->
    <input
      type="email"
      placeholder="Email"
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

    <!-- Sign Up Button -->
    <button
      on:click={handleSignUp}
      class="bg-cyan-500 hover:bg-cyan-600 active:scale-95 shadow-lg active:shadow-inner transition-transform rounded-xl px-6 py-3 font-bold text-black w-full"
    >
      Sign Up
    </button>

    <!-- Already have an account? -->
    <p class="text-xs drop-shadow-md select-none">
      Already have an account?
      <a
        href="/signin"
        class="!text-cyan-200 hover:text-white font-semibold transition-colors"
      >
        Sign in
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
      on:click={handleGoogleSignUp}
      class="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:scale-95 active:shadow-inner rounded-xl px-6 py-3 text-black shadow-md transition-transform mx-auto w-full"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        class="w-6 h-6"
      />
      Sign up with Google
    </button>

    <!-- Footer -->
    <p class="mt-1 text-xs text-cyan-300 drop-shadow-md select-none">
      Ping. Pong. Transcend.
    </p>
  </div>
</div>
