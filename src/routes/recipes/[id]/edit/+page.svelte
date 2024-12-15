  <script lang="ts">
    import {recipeQty, recipeDivisor, unitSelectMap, type SelectValue} from "$lib/recipeAmount.js";
	import { Button, SelectField, TextField, Tooltip } from "svelte-ux";
    import { mdiPlaylistPlus, mdiTrashCanOutline } from '@mdi/js';

    const {data} = $props();
    const {recipe, foodSelect} = data;

    let recipeState = $state({...recipe, ingredients: recipe.ingredients.map((ig) => ({
        foodId: ig.foodId,
        quantity: recipeQty(ig.food.domain, ig.amount, false),
        divisor: recipeDivisor(ig.food.domain, ig.amount),
    }))});

    const foodId2Units = new Map<number, SelectValue[] | undefined>(
        foodSelect.map((f) => ([f.value, unitSelectMap.get(f.domain)]))
    );

    const selectContrastColors = {
        option: "bg-neutral",
        options: "bg-neutral-300"
    };
    // $inspect(recipeState);
</script>

<h2>Edit Recipe</h2>

<TextField id="recipe_name" label="Recipe name" placement="float" bind:value={recipeState.name} required />

<h4 class="underline">Ingredients:</h4>

<table class="not-prose">
    <tbody>
        {#each recipeState.ingredients as ig, i (ig)}
            <tr>
                <td>
                    <Tooltip title="Delete Ingredient" placement="top">
                        <Button
                            icon={mdiTrashCanOutline}
                            onclick={(e:any) => {
                                recipeState.ingredients.splice(i, 1);
                            }}
                        />
                    </Tooltip>
                </td>
                <td>
                    <SelectField
                        placeholder="Food"
                        bind:value={ig.foodId}
                        options={foodSelect}
                        clearable={false}
                        classes={selectContrastColors}
                    />
                </td>
                <td>
                    <TextField
                        placeholder="Quantity"
                        bind:value={ig.quantity}
                        class="text-right w-24"
                        required
                    />
                </td>
                <td>
                    {#if foodId2Units.get(ig.foodId)}
                    <SelectField
                        placeholder="Unit"
                        bind:value={ig.divisor}
                        options={foodId2Units.get(ig.foodId)}
                        clearable={false}
                        classes={selectContrastColors}
                    />
                    {/if}    
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<Tooltip title="Add New Ingredient" placement="top">
    <Button
        icon={mdiPlaylistPlus}
        class="mt-4"
        size="lg"
        onclick={(e: any) => {
            recipeState.ingredients.push({} as typeof recipeState.ingredients[number]);
        }}
    />
</Tooltip>