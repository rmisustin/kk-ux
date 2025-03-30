import { db } from '$lib/server/db';
import { menu } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const rmMenuSchema = z.object({
    menuId: z.number().positive(),
});
const addInventorySchema = z.object({
    quantity: z.number().positive(),
    divisor: z.number().positive(),
    location: z.number().positive(),
    expires: z.string().date(),
});

export async function load ({url}) {
    const recipeList = await db.query.menuRecipes.findMany({
        with: {
            ingredients: {
                with: { food: true }}}
    });
    const shoppingList = await db.query.menuFoods.findMany({
        with: {
            inventory: {
                with: {location: true}
            },
            food: true,
        },
        where: (mf, {gt}) => gt(mf.balance, 0)
    });
    const locationSelect = (await db.query.locations.findMany()).map((loc) => ({
        label: loc.name,
        value: loc.id
    }));
    const rmMenuForm = await superValidate(zod(rmMenuSchema));
    const addInventoryForm = await superValidate(zod(addInventorySchema));

    return { recipeList, shoppingList, locationSelect, rmMenuForm, addInventoryForm };
}

export const actions = {
    rmFromMenu: async ({request}) => {
        const rmMenuForm = await superValidate(request, zod(rmMenuSchema));
        console.log("rmFromMenu:", rmMenuForm);
        if (!rmMenuForm.valid) return fail(400, { rmMenuForm })
        await db.delete(menu).where(eq(menu.id,  rmMenuForm.data.menuId));
        console.log("Returning message...");
        return message(rmMenuForm, 'Menu Item removed');
    },
    addToInventory: async ({request}) => {
        const data = await request.formData();
        console.log("addToInventory:", data);
    }
};
