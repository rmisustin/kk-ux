<script lang="ts">
	import { recipeQty, recipeUnits } from "$lib/recipeAmount.js";
    import { Button, Card, Tooltip } from "svelte-ux";
    import { mdiPencil } from '@mdi/js';

    const { data } = $props();
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
                                <Button icon={mdiPencil} href={`/inventory/${f.id}/edit`} />
                            </Tooltip>
                        </td>
                    {/if}
                </tr>
            {/each}
        {/each}
    </tbody>
</table>
</Card>