<script>
  import "remixicon/fonts/remixicon.css";
  export let value;
  export let id;

  let originalValue = value;
</script>

<div class="text-neutral-800 text-xl p-2">{originalValue}</div>
<form
  class="flex flex-col justify-items-center content-center space-y-2 m-1 rounded-md"
  action={`/api/item?rename=true&id=${id}&value=${value}`}
  method="post"
>
  <input
    class="bg-slate-300 py-1 px-2 rounded-full"
    type="text"
    name="value"
    bind:value
  />
  <input type="hidden" name="id" value={id} />
  <button
    class="text-sm border-neutral-800 hover:bg-neutral-800 hover:text-slate-100 rounded-md border-2 px-1 ml-auto"
    ><i class="ri-loop-right-line" /></button
  >
</form>
