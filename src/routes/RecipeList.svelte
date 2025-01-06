<script lang="ts">
	import { recipeQty, recipeUnits } from "$lib/recipeAmount";
    import Collapse from '$lib/Collapse.svelte';
	import { Card } from "svelte-ux";

    let group : any = $state(undefined);

    let {recipeList, recipeHeader, recipeFooter} : {
        recipeList : any,
        recipeHeader : any,
        recipeFooter ?: any
    }= $props();
</script>

<Card class="mt-2">
    {#each recipeList as recipe, i (recipe.id)}
        <Collapse bind:group value={recipe.id}>
            <div slot="action" class="pr-2">
                {@render recipeHeader?.(recipe)}
            </div>
            <div slot="trigger" class="flex-1 p-0 hover:bg-neutral-700">
                <span>{recipe.name} (Serves {recipe.servings})</span>
            </div>
            <div class="bg-neutral p-2">
                <span class="underline text-lg font-bold">Ingredients:</span>
                <div class="table pl-4">
                {#each recipe.ingredients as ig (ig)}
                    <div class="table-row">
                        <div class="table-cell text-right">{@html recipeQty(ig.food.domain, ig.amount)}</div>
                        <div class="table-cell px-3">{recipeUnits(ig.food.domain, ig.amount)}</div>
                        <div class="table-cell">{ig.food.name}</div>
                    </div>
                {/each}
                </div>
                {@render recipeFooter?.(recipe)}
            </div>
        </Collapse>
    {/each}    
</Card>
