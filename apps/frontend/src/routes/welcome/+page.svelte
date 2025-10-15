<script lang="ts">
  import { onMount } from 'svelte';
  import { authStoreMethods } from '$lib/auth/store';
  import { goto } from '$app/navigation';

  let name = '';

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
      name = data.name;
	  
	  console.log(data)
      if (data.token) {
        // setAuthToken(data.token);
		authStoreMethods.login(data.token, data);
		goto('/profile');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  });
</script>

