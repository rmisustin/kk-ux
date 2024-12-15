import { db } from '$lib/server/db';
import { ingredients } from '$lib/server/db/schema';
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