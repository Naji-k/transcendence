<script lang="ts">
  import QRCode from 'qrcode';
  import { currentUser } from '$lib/auth/store';
  import { get } from 'svelte/store';

  let email = get(currentUser)?.email ?? '';
  let otpauth = '';
  let qrDataUrl = '';
  let token = '';
  let verified = false;
  let error = '';

  async function setup2FA() {
    error = '';
    try {
      const res = await fetch('http://localhost:3000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to setup 2FA');
      const data = await res.json();
      otpauth = data.otpauth;
      qrDataUrl = await QRCode.toDataURL(otpauth);
    } catch (e) {
      error = e.message || 'Error setting up 2FA';
    }
  }

  async function verify2FA() {
    error = '';
    try {
      const res = await fetch('http://localhost:3000/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      if (!res.ok) throw new Error('Failed to verify 2FA');
      const data = await res.json();
      verified = data.ok;
      error = verified ? '' : 'Invalid code. Try again.';
    } catch (e) {
      error = e.message || 'Error verifying 2FA';
    }
  }
</script>

{#if !otpauth}
  <button on:click={setup2FA} class="bg-cyan-500 px-4 py-2 rounded">Enable 2FA</button>
{:else}
  <div>
    <p>Scan this QR code with your authenticator app:</p>
    {#if qrDataUrl}
      <img src={qrDataUrl} alt="2FA QR Code" />
    {/if}
    <input type="text" bind:value={token} placeholder="Enter 6-digit code" class="mt-2 p-2 rounded" />
    <button on:click={verify2FA} class="bg-green-500 px-4 py-2 rounded ml-2">Verify</button>
    {#if error}<p class="text-red-500">{error}</p>{/if}
    {#if verified}<p class="text-green-500">2FA enabled!</p>{/if}
  </div>
{/if}