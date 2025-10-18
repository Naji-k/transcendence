<script lang="ts">
  import { goto } from '$app/navigation';
  import { verify2FAToLogin } from '$lib/auth/auth';
  import { pendingUserId, twofaPending } from '$lib/auth/store';
  import { onMount } from 'svelte';

  let code = '';
  let error = '';

  onMount(() => {
    if (!$twofaPending) {
      goto('/signin');
    }
  });

  async function handle2FAVerify() {
    error = '';
    try {
      await verify2FAToLogin($pendingUserId, code);
    } catch (e) {
      error = e.message || 'Invalid verification code.';
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
  <div class="bg-white text-black p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-6 text-center">
    <h2 class="text-2xl font-semibold">Two-Factor Authentication</h2>
    <p class="text-sm text-gray-600">Enter your verification code</p>

    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <input
      type="text"
      placeholder="6-digit code"
      bind:value={code}
      class="w-full rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />

    <button
      on:click={handle2FAVerify}
      class="bg-cyan-500 hover:bg-cyan-600 active:scale-95 transition-transform rounded-xl px-6 py-3 font-bold text-black w-full"
    >
      Verify
    </button>
  </div>
</div>
