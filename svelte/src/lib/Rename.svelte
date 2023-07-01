<script>
  import "remixicon/fonts/remixicon.css";
  export let value;
  export let id;
</script>

<div class="text-slate-200 text-xl p-2">{value}</div>
<form class="flex flex-col justify-items-center content-center space-y-2 m-1 rounded-md" action="/api/rename" method="post">
  <input class="bg-slate-200 p-1 rounded-md" type="text" name="value" value={value} />
  <input type="hidden" name="id" value={id} />
  <button class="text-sm border-2 bg-slate-200 w-min px-1 rounded-md ml-auto"><i class="ri-loop-right-line"></i></button>
</form>