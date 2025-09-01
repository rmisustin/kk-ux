<script lang="ts">
	import { recipeQty, recipeUnits } from "$lib/recipeAmount.js";
    import { Button, Card, Tooltip, Drawer, TextField, SelectField, DateField } from "svelte-ux";
    import { mdiPencil } from '@mdi/js';
    import { superForm } from 'sveltekit-superforms/client';
    import { page } from '$app/stores';

    const { data } = $props();
    type Food = (typeof data.foodList)[number];
    //    const { message: updateInventoryMessage, enhance: updateInventoryEnhance } = superForm(data.updateInventoryForm);

    const { form, errors, enhance, message } = superForm(data.updateInventoryForm, {
        onUpdated({form}) {
            if (form.valid) {
                editingFood = null;
            }
        }
    });

    let editingFood: Food | null = null;

    function startEditing(food: Food) {
        editingFood = food;
        const inventoryData = food.inventory.map(inv => ({
            ...inv,
            originalLocationId: inv.locationId
        }));
        $form.inventories = inventoryData;
    }

</script>

<div class="flex justify-between items-center p-4 mb-4">
    <span class="text-3xl bold underline">Inventory:</span>
    <Tooltip title="Add to Inventory" placement="top">
        <Button color="secondary" variant="fill" rounded="full" href="/inventory/new/edit">Create</Button>
    </Tooltip>
</div>

<Card class="p-2">
<table class="border-0 m-0 p-4">
    <thead class="bg-neutral pb-4"><tr>
        <th>Food</th>
        <th colspan=2 class="text-center pb-4">Amount</th>
        <th           class="text-center">Location</th>
        <th           class="text-center">Expires</th>
        <th           class="text-center">Actions</th>
    </tr></thead>
    <tbody>
        {#each data.foodList as f}
            {#each f.inventory as inv,ix}
                <tr>
                    {#if ix == 0}
                        <td rowspan={f.inventoryLength} class="align-middle">{f.name}</td>
                    {/if}
                    <td class="text-right">{@html recipeQty(f.domain, inv.amount)}</td>
                    <td class="text-left">{recipeUnits(f.domain, inv.amount)}</td>
                    <td>{inv.location.name}</td>
                    <td>{inv.expires}</td>
                    {#if ix == 0}
                        <td rowspan={f.inventoryLength} class="align-middle text-center">
                            <Tooltip title="Edit Inventory" placement="top">
                                <Button icon={mdiPencil} on:click={() => startEditing(f)} />
                            </Tooltip>
                        </td>
                    {/if}
                </tr>
            {/each}
        {/each}
    </tbody>
</table>
</Card>

<Drawer open={editingFood !== null} on:close={() => editingFood = null} class="p-4">
    {#if editingFood}
        <h2 class="text-2xl font-bold mb-4">Edit {editingFood.name}</h2>
        <form method="POST" action="?/updateInventory" use:enhance>
            {#each $form.inventories as inv, i}
                <input type="hidden" name={`inventories[${i}].foodId`} value={inv.foodId} />
                <input type="hidden" name={`inventories[${i}].originalLocationId`} value={inv.originalLocationId} />
                <div class="grid grid-cols-3 gap-4 mb-4 border-b pb-4">
                    <TextField class="col-span-3" label="Amount" name={`inventories[${i}].amount`} bind:value={$form.inventories[i].amount} />
                    <SelectField class="col-span-3" label="Location" name={`inventories[${i}].locationId`} options={data.locationSelect} bind:value={$form.inventories[i].locationId} />
                    <DateField class="col-span-3" label="Expires" name={`inventories[${i}].expires`} bind:value={$form.inventories[i].expires} />
                </div>
            {/each}
            <Button type="submit">Save</Button>
            <Button on:click={() => editingFood = null} variant="outline">Cancel</Button>
        </form>
    {/if}
</Drawer>
