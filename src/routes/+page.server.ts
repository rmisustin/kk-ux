import { db } from '$lib/server/db';
import { ingredients, recipes, menu, foods, inventory } from '$lib/server/db/schema';
import { eq, sum } from 'drizzle-orm';

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

    return { recipeList, shoppingList, locationSelect };
}

export const actions = {
    rmFromMenu: async ({request}) => {
        const data = await request.formData();
        console.log("rmFromMenu:", data);
        await db.delete(menu).where(eq(menu.id,  ~~(data.get("menuId") as string)));
    },
    addToInventory: async ({request}) => {
        const data = await request.formData();
        console.log("addToInventory:", data)
    }
};
