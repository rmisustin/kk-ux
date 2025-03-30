<script lang="ts">
    import { Tooltip, TextField, Card, Icon, Button } from "svelte-ux";
    import { mdiMagnify, mdiPlaylistEdit, mdiPlaylistPlus } from '@mdi/js';
	import RecipeList from '../RecipeList.svelte';

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

<div class="flex justify-between items-center p-4 mb-4">
    <span class="text-3xl bold underline">Recipes:</span>
    <Tooltip title="Create New Recipe" placement="top">
        <Button color="secondary" variant="fill" rounded="full" href="/recipes/new/edit">Create</Button>
    </Tooltip>
</div>

<TextField
    label="Search by ingredient"
    labelPlacement="float"
    clearable
    rounded icon={mdiMagnify} bind:value={searchTerm}
/>

<RecipeList recipeList={filteredRecipes}>
    {#snippet recipeHeader(recipe: { id: any; })}
        <Tooltip title="Add to Menu" placement="top">
            <form method="POST" action="?/addToMenu">
                <input type=hidden name="recipeId" value={recipe.id} />
                <Button type="submit" icon={mdiPlaylistPlus} />
            </form>
        </Tooltip>
    {/snippet}
    {#snippet recipeFooter(recipe: { id: any; })}
        <Tooltip title="Edit Recipe" placement="top">
            <a href="/recipes/{recipe.id}/edit">
                <Icon data={mdiPlaylistEdit} />
            </a>
        </Tooltip>
    {/snippet}
</RecipeList>
