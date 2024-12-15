import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
// import { env } from '$env/dynamic/private';
import { foods, locations, inventory, recipes, ingredients } from './schema';
import { sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = createClient({ url: process.env.DATABASE_URL });
export const db = drizzle(client);

async function main() {
    await db.delete(recipes);
    await db.delete(foods);
    await db.delete(ingredients);

    // const recipeIds = await db.insert(recipes).values(recipeData).returning();
    const recipeIds = await db.insert(recipes).values(recipeData).returning({recipeId: recipes.id});
    console.log("RecipeIds: ", recipeIds);
    for (const [i,r] of recipeData.entries()) {
        const foodIds = await db.insert(foods).values(
            r.ingredients.map((g) => g.food)
        ).onConflictDoUpdate({
            target: foods.name,
            set: { name: sql`name` }
        }).returning({foodId: foods.id});
        console.log("foodIds: ", foodIds);
        console.log("values to insert: ", r.ingredients.map((g, j) =>
            Object.assign({}, g, recipeIds[i], foodIds[j])
        ));
        await db.insert(ingredients).values(r.ingredients.map((g, j) => (
            Object.assign({}, g, recipeIds[i], foodIds[j]) as (typeof ingredients.$inferInsert)
        )));
    }
}
let recipeData = [
    {
        name: 'Chicken Gaston Gerard',
        ingredients: [
            {
                food: { name: 'Chicken, Thigh, Boneless Skinless', domain: 'Q' },
                amount: 6
            },
            {
                food: { name: 'Butter', domain: 'V' },
                amount: 24 * 3 * 3
            },
            {
                food: { name: 'Oil, Safflower', domain: 'V' },
                amount: 24 * 3 * 3
            },
            {
                food: { name: 'Onion, Sweet', domain: 'Q' },
                amount: 1
            },
            {
                food: { name: 'Paprika', domain: 'V' },
                amount: 24 / 2
            },
            {
                food: { name: 'Wine, White, Dry', domain: 'V' },
                amount: 24 * 3 * 16 * 3 / 2
            },
            {
                food: { name: 'Mustard, Dijon', domain: 'V' },
                amount: 24 * 2
            },
            {
                food: { name: 'Creme Fraiche', domain: 'V' },
                amount: 24 * 3 * 16 * 3 / 4
            },
            {
                food: { name: 'Cheese, Gruyere', domain: 'V' },
                amount: 24 * 3 * 16
            },        
        ]
    },
    {
        name: 'Ginger-Honey Chicken',
        ingredients: [
            {
                food: { name: 'Chicken, Thigh, Boneless Skinless', domain: 'Q' },
                amount: 4
            },
            {
                food: { name: 'Salt', domain: 'V' },
                amount: 24 / 2
            },
            {
                food: { name: 'Ginger, Ground', domain: 'V' },
                amount: 24 * 3 / 4
            },
            {
                food: { name: 'Ginger, Fresh', domain: 'V' },
                amount: 24 * 3
            },
            {
                food: { name: 'Honey', domain: 'V' },
                amount: 24 * 3 * 3
            },
            {
                food: { name: 'Lemon Juice', domain: 'V' },
                amount: 24 * 3
            },
            {
                food: { name: 'Soy Sauce, Low Sodium', domain: 'V' },
                amount: 24 * 3
            }
        ]
    }
];

main();