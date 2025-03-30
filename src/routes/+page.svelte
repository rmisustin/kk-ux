<script lang="ts">
	import { superForm } from "sveltekit-superforms/client";
	import { Tooltip, Button, Notification, Toggle, Popover, Card, DateField, Drawer, SelectField, TextField } from "svelte-ux";
	import RecipeList from "./RecipeList.svelte";
    import { mdiTrashCanOutline, mdiChevronDown, mdiCartPlus, mdiContentSave, mdiCheckCircleOutline } from '@mdi/js';
	import { recipeQty, recipeUnits, unitSelectMap } from "$lib/recipeAmount";
	import { format, parse, addDays, addMonths, addYears } from 'date-fns';

    let {data} = $props();
    const { recipeList, shoppingList, locationSelect, rmMenuForm, addInventoryForm } = data;
    const { message: rmMenuMessage, enhance: rmMenuEnhance } = superForm(data.rmMenuForm);
    const { message: addInventoryMessage, enhance: addInventoryEnhance } = superForm(data.addInventoryForm);

    let expireDate = $state<Date | null>(null);
    function incExpire(e : {target: HTMLFormElement}) {
        const refdate = expireDate ?? new Date();
        // const expires = e.target.form.querySelector('[name="expires"]');
        // const cur = new Date();
        // let refdate = parse(expires.value ? expires.value : format(cur, 'MM/dd/yyyy'), 'MM/dd/yyyy', cur);
        console.log("refdate date is ", refdate);
        switch (e.target.textContent?.trim()) {
            case "+1wk": expireDate = addDays(refdate, 7); break;
            case "+1mo": expireDate = addMonths(refdate, 1); break;
            case "+1yr": expireDate = addYears(refdate, 1); break;
        }
        console.log("expireDate is ", expireDate);
        // expires.value = format(refdate, 'MM/dd/yyyy');
    }
</script>

<div class="text-3xl bold underline mb-8">This Week's Menu:</div>

<RecipeList recipeList={data.recipeList}>
    {#snippet recipeHeader(recipe: typeof data.recipeList[number])}
        <Tooltip title="Remove f/ Menu" placement="top">
            <form method="POST" action="?/rmFromMenu" use:rmMenuEnhance>
                <input type=hidden name="menuId" value={recipe.id} />
                <Button type="submit" icon={mdiTrashCanOutline} />
            </form>
        </Tooltip>
    {/snippet}
</RecipeList>

{#if $rmMenuMessage}
    <Notification
        title={$rmMenuMessage}
        icon={mdiCheckCircleOutline}
        color="success"
        closeIcon
    />
{/if}

<div class="text-3xl bold underline my-8">Shopping List:</div>

<Card class="p-2">
<table class="border-0 m-0 p-4">
    <thead class="bg-neutral pb-4"><tr>
        <th>Food</th>
        <th colspan=2 class="text-center pb-4">Need</th>
        <th colspan=2 class="text-center">Have</th>
        <th colspan=2 class="text-center">Buy</th>
        <th           class="text-center">Actions</th>
    </tr></thead>
    <tbody>
        {#each data.shoppingList as f}
        <tr>
            <td>{f.food.name}</td>
            <td class="text-right">{@html recipeQty(f.food.domain, f.need)}</td>
            <td class="text-left">{recipeUnits(f.food.domain, f.need)}</td>
            {#if f.have == 0}
            <td colspan=2 class="text-center">--</td>
            {:else}
            <td class="text-right">{@html recipeQty(f.food.domain, f.have)}</td>
            <td class="text-left">{recipeUnits(f.food.domain, f.have)}</td>
            {/if}
            <td class="text-right">{@html recipeQty(f.food.domain, f.balance)}</td>
            <td class="text-left">{recipeUnits(f.food.domain, f.balance)}</td>
            <td class="text-right whitespace-nowrap">
                {#if f.inventory.length > 0}
                <Toggle let:on={open} let:toggle let:toggleOff>
                    <Popover {open} on:close={toggleOff} placement="bottom-end">
                        <div class="px-6 py-4 bg-neutral border shadow">
                            <div class="text-lg bold underline mb-4">Locations:</div>
                            <table><tbody>
                                {#each f.inventory as inv}
                                <tr>
                                    <td class="text-right">{@html recipeQty(f.food.domain, inv.amount)}</td>
                                    <td class="text-left">{recipeUnits(f.food.domain, inv.amount)}</td>
                                    <td>in {inv.location?.name}</td>
                                    <td>(expires: {inv.expires})</td>
                                </tr>
                                {/each}
                            </tbody></table>
                        </div>
                    </Popover>
                    <Tooltip title="Show Inventory" placement="top">
                        <Button on:click={toggle} icon={mdiChevronDown} />
                    </Tooltip>
                </Toggle>
                {/if}
                <Toggle let:on={open} let:toggle let:toggleOff>
                    <Drawer {open} placement="left" class="w-[400px] flex flex-col justify-center">
                        <form method="POST" action="?/addToInventory" use:addInventoryEnhance>
                            <input type="hidden" hidden name="foodId" value={f.foodId} />
                            <div class="mx-4 grid grid-cols-2 gap-2">
                                <div class="text-lg bold col-span-2">
                                    Add to Inventory:<br />
                                    <div class="text-xl italic [--text-color:theme(colors.primary)]">{f.food.name}</div>
                                    <hr /><br />
                                </div>
                                <TextField
                                    name="quantity"
                                    placeholder="Quantity"
                                    class="text-right col-span-1"
                                    required autofocus
                                />
                                {#if unitSelectMap.get(f.food.domain)}
                                <SelectField
                                    name="divisor"
                                    placeholder="Unit"
                                    options={unitSelectMap.get(f.food.domain)}
                                    clearable={false}
                                    class="col-span-1"
                                    required
                                />
                                {:else}
                                <input type="hidden" hidden name="divisor" value={1} />
                                {/if}
                                <SelectField
                                    name="location"
                                    placeholder="Location"
                                    options={data.locationSelect}
                                    clearable={false}
                                    required
                                    class="col-span-2"
                                />
                                <DateField 
                                    label="Expires"
                                    format="yyyy-MM-dd"
                                    picker clearable
                                    name="expires"
                                    class=col-span-2
                                    bind:value={expireDate}
                                />
                                <div class="col-span-2 flex justify-around">
                                    <Button onclick={incExpire} color="secondary" variant="outline" rounded="full">+1wk</Button>
                                    <Button onclick={incExpire} color="secondary" variant="outline" rounded="full">+1mo</Button>
                                    <Button onclick={incExpire} color="secondary" variant="outline" rounded="full">+1yr</Button>
                                </div>
                                <div class="col-span-2 flex justify-around">
                                    <Button
                                        type="submit"
                                        class="mt-4"
                                        icon={mdiContentSave}
                                        color="primary"
                                        variant="fill"
                                        rounded="full"
                                    >Save</Button>
                                </div>
                            </div>
                        </form>
                        <div slot="actions">
                            <Button on:click={toggleOff}>Cancel</Button>
                        </div>
                    </Drawer>
                    <Tooltip title="Add to Inventory" placement="top">
                        <Button on:click={() => {toggle(); if (open) expireDate = null; }} icon={mdiCartPlus} />
                    </Tooltip>
                </Toggle>
            </td>
        </tr>
        {/each}
    </tbody>
</table>
</Card>
