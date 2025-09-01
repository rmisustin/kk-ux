import { db } from '$lib/server/db';
import { inventory } from '$lib/server/db/schema';
import { asc, sum, eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const updateInventorySchema = z.object({
    inventories: z.array(z.object({
        foodId: z.number(),
        locationId: z.number(),
        originalLocationId: z.number(),
        amount: z.number(),
        expires: z.string().nullable()
    }))
});

export async function load() {
    const inventoryList = await db.query.inventory.findMany({
        with: {
            food: true,
            location: true
        }
    });
    const foodListQ = await db.query.foods.findMany({
        with: {
            inventory: {
                orderBy: [asc(inventory.expires)],
                with: {
                    location: true,
                }
            }
        }
    });

    const foodList = foodListQ.map((food) => {
        const inventoryLength = food.inventory.length;
        return {...food, 
            inventoryLength: inventoryLength,
            totalAmt: food.inventory.reduce((a, b) => a + b.amount, 0),
            minExpires: food.inventory.reduce((a, b) => b.expires && (b.expires < a) ? b.expires : a, '9999-99-99')
        };
    }).filter((food) => food.inventoryLength > 0).sort((a, b) => a.minExpires.localeCompare(b.minExpires));
    const locationSelect = (await db.query.locations.findMany()).map((loc) => ({
        label: loc.name,
        value: loc.id
    }));

    const updateInventoryForm = await superValidate(zod(updateInventorySchema));

    return { inventoryList, foodList, locationSelect, updateInventoryForm };
}

export const actions = {
    updateInventory: async ({request}) => {
        const form = await superValidate(request, zod(updateInventorySchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        for (const inv of form.data.inventories) {
            await db.update(inventory).set({
                amount: inv.amount,
                expires: inv.expires,
                locationId: inv.locationId
            }).where(and(eq(inventory.foodId, inv.foodId), eq(inventory.locationId, inv.originalLocationId)));
        }

        return message(form, "Inventory updated successfully");
    }
};