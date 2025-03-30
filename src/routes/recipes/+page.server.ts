import { db } from '$lib/server/db';
import { ingredients, menu } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load ({url}) {
    const withIngredient = url.searchParams.get('with-ingredient');
    const idList = withIngredient && await db.query.ingredients.findMany({
        columns: {recipeId: true },
        where: eq(ingredients.foodId, Number(withIngredient))
    });
    const recipeList = await db.query.recipes.findMany({
        with: {
            ingredients: {
                with: { food: true }}}});
    return { recipeList, idList }
}

export const actions = {
    addToMenu: async ({request}) => {
        const data = await request.formData();
        console.log("addToMenu:", data);
        await db.insert(menu).values({
            recipeId: ~~(data.get("recipeId") as string)
        });
    }
};
