<script>
  const signIn = () => {
    alert('Username/Password login');
  };

  const googleSignIn = () => {
    alert('Google OAuth login');
  };
</script>

<div class="neon-neumorphic">
  <h1
    class="text-4xl mb-2"
    style="text-shadow: 0 0 6px #00c6ff, 0 0 12px #ff0000, 0 0 18px #ffff00"
  >
    PONG
  </h1>
  <p class="mb-6 text-white" style="text-shadow: 0 0 6px #00c6ff">
    Sign in to start playing
  </p>

  <input
    type="text"
    placeholder="Username"
    autocomplete="username"
    class="bg-[#111827] rounded-[20px] border-none p-4 w-full mb-4 font-mono text-xs text-[#eee] shadow-inner outline-none text-center tracking-[2px] placeholder:text-[#888]"
  />

  <input
    type="password"
    placeholder="Password"
    autocomplete="current-password"
    class="bg-[#111827] rounded-[0px] border-none p-4 w-full mb-4 font-mono text-xs text-[#eee] shadow-inner outline-none text-center tracking-[2px] placeholder:text-[#888]"
  />

  <button class="btn-neon" on:click={signIn}>
    Sign In
  </button>

  <div class="divider">
    <div></div>
    OR
    <div></div>
  </div>

  <button class="btn-neon btn-google" on:click={googleSignIn}>
    <img
      src="https://www.svgrepo.com/show/475656/google-color.svg"
      alt="Google"
      class="google-icon"
    />
    Continue with Google
  </button>

  <a href="/testpage" class="testpage-link">Go to Test Page</a>

  <p class="footer-text">Ping. Pong. Transcend.</p>
</div>
