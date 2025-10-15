<script lang="ts">
  import { onMount } from 'svelte';
  import { authStoreMethods} from '$lib/auth/store';
  import { goto } from '$app/navigation';
  import { verify2FAToLogin } from '$lib/auth/auth';

  let twofaRequired = false;
  let userId = null;
  let code = '';
  let error = '';

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        credentials: 'include', // so cookies are sent
      });

      if (!res.ok) {
        console.error('Auth check failed');
        return;
      }

      const data = await res.json();
	  
	    console.log(data)
      if (data.token) {
        // setAuthToken(data.token);
		    authStoreMethods.login(data.token, data);
        twofaRequired = data.twofaEnabled;
        userId = data.userId;
        if (!twofaRequired) goto('/profile');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  });

  async function handle2FAVerify() {
    error = '';
    try {
      await verify2FAToLogin(userId, code);
      goto('/profile');
    } catch (e) {
      error = e;
    }
  }

</script>

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

