<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    fetch('/api/auth/google/callback')
      .then((response) => response.json())
      .then((data) => {
        
        localStorage.setItem('token', data.token);

        alert(`Welcome, ${data.user.name}`);

        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Error during Google Sign-In callback:', error);
        alert('Failed to sign in with Google.');
      });
  });
</script>

<div class="flex items-center justify-center min-h-screen">
  <p>Signing you in...</p>
</div>