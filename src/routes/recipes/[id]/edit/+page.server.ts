import { db } from '$lib/server/db';
import { recipes, foods } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load ({params}) {
    const qid = params.id;
    const recipeQuery = await db.query.recipes.findFirst({
        with: {
            ingredients: {
                with: { food: true }}},
                where: eq(recipes.id, Number(qid))});
    const recipe = recipeQuery ?? {} as NonNullable<typeof recipeQuery>;
    const foodSelect = await db.select({
        value: foods.id,
        label: foods.name,
        domain: foods.domain
    }).from(foods);
    return {recipe, foodSelect};
}

export const actions = {
    edit: async ({request}) => {
        const data = await request.formData();
        console.log("Form data:", data);
    }
}