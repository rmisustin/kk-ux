import { db } from '$lib/server/db';
import { menu } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';

export async function load () {
    const menuCount = (await db.select({ menuCount: count() }).from(menu))[0].menuCount;
    return {menuCount};
}
