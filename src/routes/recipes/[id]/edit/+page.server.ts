import { db } from '$lib/server/db';
import { recipes, foods } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load ({params}) {
    const qid = isNaN(Number(params.id)) ? -1 : Number(params.id);
    const recipeQuery = await db.query.recipes.findFirst({
        with: {
            ingredients: {
                with: { food: true }}},
                where: eq(recipes.id, qid)});
    const recipe = recipeQuery ?? {ingredients:[]} as NonNullable<typeof recipeQuery>;
    const foodSelect = await db.select({
        value: foods.id,
        label: foods.name,
        domain: foods.domain
    }).from(foods);
    return {recipe, foodSelect};
}

export const actions = {
    addfood: async ({request}) => {
        const data = await request.formData();
        const insertedFoods = await db.insert(foods).values({
            name: data.get("name") as string,
            domain: data.get("domain") as string
        }).returning();
        return {
            value: insertedFoods[0].id,
            label: insertedFoods[0].name,
            domain: insertedFoods[0].domain
        };
    }
}