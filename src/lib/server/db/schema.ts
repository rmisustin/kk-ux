import { sqliteTable, text, integer, check, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// Domains:
//
// Recipes and inventories need to store quantities of foods. A given food
// needs to belong to some domain of measurement. The most common domain is
// volume, but weight and pure quantity are also used. The domains are defined
// thus:
//
// Enum:  Domain:    Description:
//    V   Volume     The volume of the given food (i.e., tsp, tbsp, cups, quarts, etc.)
//    W   Weight     The weight of the given food (i.e., oz, lb, etc.)
//    Q   Quantity   The number of the given food (e.g., 2 eggs or 1 chicken breast)
//
// For volume and weight, we need an atomic unit for storage purposes (i.e., the finest unit
// of measurement for that domain). This allows integers to represent the actual amount and
// allows easy calculation between units. For volume, we will use 1/24th of a teaspoon. For
// weight, we will use 1/8th of an ounce.

export const foods = sqliteTable('foods',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull().unique(),
		domain: text('domain').notNull()
	},
	(table) => ({
		domainCheck: check('domainCheck', sql`${table.domain} IN ("V", "W", "Q")`),
	})
);

export const foodsRelations = relations(foods, ({ one, many }) => ({
	ingredients: many(ingredients),
	inventory: many(inventory)
}));

export const locations = sqliteTable('locations', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull()
});

export const inventory = sqliteTable('inventory',
	{
		foodId: integer('foodId').references(() => foods.id),
		locationId: integer('locationId').references(() => locations.id),
		amount: integer('amount').notNull(),
	}, (table) => ({
		pk: primaryKey({ columns: [table.foodId, table.locationId]}),
	})
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
	food: one(foods, {
		fields: [inventory.foodId],
		references: [foods.id]
	}),
	location: one(locations, {
		fields: [inventory.locationId],
		references: [locations.id]
	}),
}));

export const recipes = sqliteTable('recipes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description')
});

export const recipesRelations = relations(recipes, ({ many }) => ({
	ingredients: many(ingredients)
}));

export const ingredients = sqliteTable('ingredients',
	{
		recipeId: integer('recipeId').notNull().references(() => recipes.id),
		foodId: integer('foodId').notNull().references(() => foods.id),
		amount: integer('amount').notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.recipeId, table.foodId]}),
		ingredientByFood: index("ingredientByFood").on(table.foodId)
	})
);

export const ingredientsRelations = relations(ingredients, ({ one, many }) => ({
	food: one(foods, {
		fields: [ingredients.foodId],
		references: [foods.id]
	}),
	recipe: one(recipes, {
		fields: [ingredients.recipeId],
		references: [recipes.id]
	})
}));