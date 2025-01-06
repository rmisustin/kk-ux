import { json } from "@sveltejs/kit";
import { parseAmount } from "$lib/recipeAmount";
import { db } from '$lib/server/db';
import { recipes, ingredients } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST ({request, cookies}) {
    const recipe = await request.json();
    // console.log("recipe:", recipe);
    let id : number = recipe.id;
    if (id) {
        // Update an existing recipe..
        // ..by overwriting name..
        await db.update(recipes)
        .set({name: recipe.name})
        .where(eq(recipes.id, id));
        //..then deleting existing ingredients..
        await db.delete(ingredients).where(
            eq(ingredients.recipeId, id)
        );
        //..then fall through to add new ingredients..
    } else {
        // Create a new recipe..
        // ..by inserting a new recipe record..
        id = (await db.insert(recipes)
        .values({name: recipe.name, servings: recipe.servings})
        .returning({id: recipes.id}))[0].id;
        // ..and falling through to insert ingredients..
    }
    await db.insert(ingredients)
    .values(recipe.ingredients.map((g: { foodId: number; quantity: string; divisor: number; }) => ({
        recipeId: id,
        foodId: g.foodId,
        amount: parseAmount(g.quantity, g.divisor)
    })));
    return json({save: {success: true, id}}, { status: 201 });
}