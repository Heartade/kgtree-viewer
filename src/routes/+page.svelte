<script lang="ts">
	import { SceneManager } from '$lib/babylon/SceneManager';
	import { onMount } from 'svelte';
	import type { KGNode } from '$lib/data/buildKGGraph';

	export let data: { body: { kgNode: KGNode } };

	let canvas: HTMLCanvasElement;
	let sceneManager: SceneManager;

	onMount(() => {
		const rootNode = data.body.kgNode;
		sceneManager = new SceneManager(canvas, rootNode);
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<canvas class="w-full flex grow" bind:this={canvas} />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}
</style>
