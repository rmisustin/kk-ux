import { db } from '$lib/server/db';
import { inventory } from '$lib/server/db/schema';
import { asc, sum } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/gel-core';

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
    console.log("foodList:", foodList);
    return { inventoryList, foodList };
}