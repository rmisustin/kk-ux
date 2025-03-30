<script lang="ts">
	import { AppBar, NavItem } from 'svelte-ux';
	import chef from "$lib/images/chef.png";
	import '../app.css';
	import { page } from '$app/stores';
	let { children, data } = $props();
</script>

<AppBar title="Example (shown in window title)" class="bg-primary" menuIcon={null}>
	<div slot="title">
		<a href="/" class="flex items-center gap-x-2">
			<img src={chef} class="me-1 h-16 sm:h-16" alt="Chef Logo" />
			<span class="text-2xl font-bold italic">Karen's Kitchen</span>
			{#if data.menuCount}
				<span class="rounded-full bg-neutral-300 border px-2 flex items-center justify-center">{data.menuCount}</span>
			{/if}
		</a>
	</div>
	<div slot="actions" class="flex gap-3 text-xl pr-6">
		<NavItem text="Recipes" currentUrl={$page.url} path="/recipes" />
		<NavItem text="Inventory" currentUrl={$page.url} path="/inventory" />
	</div>
</AppBar>
  
<div class="p-5 prose lg:prose-xl dark:prose-invert">
	{@render children()}
</div>
