<script>
    import logo from "../assets/logo.png";
</script>

<div class="flex flex-col items-center mt-4 p-6">
    <img src={logo} alt="ltd" class="w-8 h-auto mb-2" />
    <div>
        <form
            class="text-neutral-800 space-y-2 m-4 text-center"
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
                <button class="text-2xl text-slate-200 m-2" type="submit"
                    ><i class="ri-login-circle-line" /></button
                >
            </p>
        </form>
    </div>
</div>
