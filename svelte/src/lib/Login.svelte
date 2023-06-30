<div class="text-3xl text-slate-200 text-center m-2 mt-4">ltd</div>
<div>
    <form
        class="space-y-2 m-4 text-center"
        id="login-form"
        method="post"
        action="api/ldaplogin"
    >
        <div>
            <input
                class="rounded-md p-1"
                type="text"
                name="username"
                placeholder="DN"
                required
            />
        </div>
        <div>
            <input
                class="rounded-md p-1"
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
