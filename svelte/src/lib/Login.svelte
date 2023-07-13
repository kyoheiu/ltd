<script>
  import logo from "../assets/logo.png";
  import Footer from "./Footer.svelte";
</script>

<div class="mt-4 flex h-screen flex-col items-center p-6">
  <img src={logo} alt="ltd" class="mb-2 h-auto w-8" />
  <div class="flex-grow">
    <form
      class="m-4 space-y-2 text-center text-neutral-800"
      id="login-form"
      method="post"
      action="api/ldaplogin"
    >
      <div>
        <input
          class="rounded-md bg-slate-200 p-1"
          type="text"
          name="username"
          placeholder="DN"
          required
        />
      </div>
      <div>
        <input
          class="rounded-md bg-slate-200 p-1"
          type="password"
          name="password"
          placeholder="PASSWORD"
          required
        />
      </div>
      <p>
        <button class="m-2 text-2xl text-slate-200" type="submit"
          ><i class="ri-login-circle-line" /></button
        >
      </p>
    </form>
  </div>
  <Footer />
</div>
