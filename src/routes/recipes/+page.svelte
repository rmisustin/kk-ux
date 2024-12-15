<script lang="ts">
    import Collapse from '$lib/Collapse.svelte';
    import { Tooltip, TextField, Card, Icon, Button } from "svelte-ux";
    import { recipeQty, recipeUnits } from '$lib/recipeAmount.js';
    import { mdiMagnify, mdiPlaylistEdit, mdiPlaylistPlus } from '@mdi/js';

    const { data } = $props();

    let searchTerm = $state("");
    let group : any = $state(undefined);

    let filteredRecipes = $derived(
        data.recipeList.filter((r) => {
            if (
                Array.isArray(data.idList) &&
                !data.idList.some((f) => r.id == f.recipeId)
            ) {
                return false;
            }
            return (
                !searchTerm ||
                r.ingredients.reduce(
                    (sofar, g) =>
                        sofar ||
                        g.food.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                    false,
                )
            );
        }),
    );
    // $inspect(searchTerm, filteredRecipes);
</script>

<h2>Recipes</h2>
<br />
<TextField
    label="Search by ingredient"
    labelPlacement="float"
    clearable
    rounded icon={mdiMagnify} bind:value={searchTerm}
/>
<Card class="mt-2">
    {#each filteredRecipes as recipe, i}
        <Collapse bind:group value={recipe.id}>
            <div slot="action" class="pr-2">
                <Tooltip title="Add to Menu" placement="top">
                    <Button icon={mdiPlaylistPlus} onclick={(e: any) => {
                        alert("Need to implement add-recipe-to-menu");
                    }} />
                </Tooltip>
            </div>
            <div slot="trigger" class="flex-1 p-0 hover:bg-neutral-700">
            <span>{recipe.name}</span>
            </div>
            <div class="bg-neutral p-2">
                <span class="underline text-lg font-bold">Ingredients:</span>
                <div class="table pl-4">
                {#each recipe.ingredients as ig}
                    <div class="table-row">
                        <div class="table-cell text-right">{@html recipeQty(ig.food.domain, ig.amount)}</div>
                        <div class="table-cell px-3">{recipeUnits(ig.food.domain, ig.amount)}</div>
                        <div class="table-cell">{ig.food.name}</div>
                    </div>
                {/each}
                </div>
                <Tooltip title="Edit Recipe" placement="top">
                    <a href="/recipes/{recipe.id}/edit">
                        <Icon data={mdiPlaylistEdit} />
                    </a>
                </Tooltip>
            </div>
        </Collapse>
    {/each}    
</Card>
