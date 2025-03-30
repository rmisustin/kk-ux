<script lang="ts">
    import { recipeQty, recipeDivisor, unitSelectMap, type SelectValue} from "$lib/recipeAmount.js";
	import { Button, Notification, Drawer, Icon, SelectField, TextField, Tooltip, Field } from "svelte-ux";
    import { mdiCheckCircleOutline, mdiContentSave, mdiDrag, mdiFoodVariant, mdiPlaylistPlus, mdiShakerOutline, mdiTrashCanOutline } from '@mdi/js';
	import { dragHandle, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	import type { ActionResult } from "@sveltejs/kit";
	import { deserialize, applyAction, enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";

    const {data, form} = $props();
    const {recipe, foodSelect} = data;

    let recipeState = $state({...recipe, ingredients: recipe.ingredients.map((ig,i) => ({
        id: i,
        foodId: ig.foodId,
        quantity: recipeQty(ig.food.domain, ig.amount, false),
        divisor: recipeDivisor(ig.food.domain, ig.amount),
    }))});

    // svelte-ignore non_reactive_update
    let autoFocus = false;

    function addEmptyIngredient() {
        const id = recipeState.ingredients.length;
        recipeState.ingredients.push({id} as typeof recipeState.ingredients[number]);
    }

    if (recipeState.ingredients.length == 0) {
        addEmptyIngredient();
    }

    const foodId2Units = new Map<number, SelectValue[] | undefined>(
        foodSelect.map((f) => ([f.value, unitSelectMap.get(f.domain)]))
    );

    const selectContrastColors = {
        option: "bg-neutral",
        options: "bg-neutral-300"
    };

    const flipDurationMs = 200;
    function handleDnd(e: CustomEvent<DndEvent<typeof recipeState.ingredients[number]>>) {
		recipeState.ingredients = e.detail.items;
	}

    let wasSaved = $state(false);
    let saveError = $state(false);
    async function saveRecipe(event: Event & {currentTarget: EventTarget & HTMLFormElement}) {
        event.preventDefault();
        const response = await fetch(event.currentTarget.action, {
			method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
			body: JSON.stringify(recipeState),
		});
        const result = await response.json();
        wasSaved = result?.save?.success;
        saveError = !wasSaved;
    }

    let openAddFood = $state(false);
    // $inspect(recipeState);
</script>

<h2>Edit Recipe</h2>

<form method="POST" action="save" onsubmit={saveRecipe}>

<TextField
    label="Recipe name"
    placement="float"
    bind:value={recipeState.name}
    required
    autofocus={!recipeState.name}
/>

<Field label="Number of Servings" let:id class="mt-4">
    <input {id} type="number" bind:value={recipeState.servings} />
</Field>

<h4 class="underline">Ingredients:</h4>

<div
    use:dragHandleZone="{{items: recipeState.ingredients, flipDurationMs}}"
    onconsider="{handleDnd}"
    onfinalize="{handleDnd}"
>
    {#each recipeState.ingredients as ig, i (ig.id)}
        <div animate:flip="{{duration: flipDurationMs}}" class="grid grid-cols-9 gap-2 mt-2">
            <div class="flex items-center">
                <div use:dragHandle>
                    <Tooltip title="Drag to reorder" placement="top">
                        <Icon data={mdiDrag} />
                    </Tooltip>
                </div>
                <Tooltip title="Delete Ingredient" placement="top">
                    <Button
                        icon={mdiTrashCanOutline}
                        onclick={(e:any) => {
                            recipeState.ingredients.splice(i, 1);
                        }}
                    />
                </Tooltip>
            </div>
            <SelectField
                placeholder="Food"
                bind:value={ig.foodId}
                options={foodSelect}
                clearable={false}
                classes={selectContrastColors}
                class="col-span-4"
                autofocus={autoFocus}
                required
            />
            <TextField
                placeholder="Quantity"
                bind:value={ig.quantity}
                class="text-right col-span-2"
                required
            />
            {#if foodId2Units.get(ig.foodId)}
            <SelectField
                placeholder="Unit"
                bind:value={ig.divisor}
                options={foodId2Units.get(ig.foodId)}
                clearable={false}
                classes={selectContrastColors}
                class="col-span-2"
                required
            />
            {/if}
        </div>
    {/each}
</div>

<div class="flex flex-row-reverse justify-between items-center mt-2">
<Tooltip title="Add New Ingredient" placement="top">
    <Button
        icon={mdiPlaylistPlus}
        size="lg"
        onclick={(e: any) => {
            autoFocus = true;
            addEmptyIngredient();
        }}
    />
</Tooltip>
<div class="flex gap-4">
<Tooltip title="Save Recipe" placement="top">
    <Button
        type="submit"
        icon={mdiContentSave}
        color="primary"
        variant="fill"
        rounded="full"
    >Save</Button>
</Tooltip>
<Tooltip title="Add Food Choice" placement="top">
    <Button
        icon={mdiShakerOutline}
        on:click={() => (openAddFood = true)}
        color="secondary"
        variant="fill"
        rounded="full"
    >
        Add
    </Button>
</Tooltip>
</div>
</div>
</form>

<Notification
    title="Successfully Saved!"
    icon={mdiCheckCircleOutline}
    color="success"
    bind:open={wasSaved}
    closeIcon
/>
<Notification
    title="Something went wrong in save!"
    icon={mdiCheckCircleOutline}
    color="warning"
    bind:open={saveError}
    closeIcon
/>


<Drawer bind:open={openAddFood} placement="left" class="w-[400px] flex flex-col justify-center">
    <form method="POST" action="?/addfood" use:enhance={() => {
        return async ({result}) => {
            console.log("Add food result:", result);
            if (result.type === 'success') {
                const f = result.data as typeof foodSelect[number]
                foodSelect.push(f);
                foodId2Units.set(f.value, unitSelectMap.get(f.domain));
                openAddFood = false;
            }
            applyAction(result);
        }
    }}>
        <div class="flex flex-col ml-4 mr-4">
            <span class="text-xl">Add Food:</span>
            <TextField
                label="Food name"
                name="name"
                class="my-4"
                placement="float"
                autofocus
                required
            />
            <SelectField
                label="How measured"
                name="domain"
                options={[
                    {label: "by Volume", value: 'V'},
                    {label: "by Weight", value: 'W'},
                    {label: "by Count",  value: 'Q'}
                ]}
                value="V"
                classes={selectContrastColors}
                clearable={false}
                required
            />
            <Button
                type="submit"
                class="mt-4"
                icon={mdiContentSave}
                color="primary"
                variant="fill"
                rounded="full"
            >Save</Button>
        </div>
    </form>
    <div slot="actions">
        <Button on:click={() => (openAddFood = false)}>Close</Button>
    </div>
</Drawer>