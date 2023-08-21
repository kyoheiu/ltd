<script>
  import logo from "../assets/logo.png";
  import Footer from "./Footer.svelte";
  import IconLogin from "@tabler/icons-svelte/dist/svelte/icons/IconLogin.svelte";
</script>

<div class="mt-4 flex h-screen flex-col items-center p-6">
  <img src={logo} alt="ltd" class="h-auto w-5" />
  <div class="flex-grow">
    <form
      class="m-4 space-y-2 text-center text-background"
      id="login-form"
      method="post"
      action="api/ldaplogin"
    >
      <div>
        <input
          class="rounded-full bg-foreground px-4 py-1 text-sm"
          type="text"
          name="username"
          placeholder="DN"
          required
        />
      </div>
      <div>
        <input
          class="rounded-full bg-foreground px-4 py-1 text-sm"
          type="password"
          name="password"
          placeholder="PASSWORD"
          required
        />
      </div>
      <p>
        <button class="m-2 text-foreground" type="submit"><IconLogin /></button>
      </p>
    </form>
  </div>
  <Footer />
</div>
