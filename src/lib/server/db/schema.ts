import { sqliteTable, text, real, integer, check, primaryKey, index, sqliteView } from 'drizzle-orm/sqlite-core';
import { relations, sql, sum, eq, getTableColumns } from 'drizzle-orm';

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
		foodId: integer('foodId').notNull().references(() => foods.id),
		locationId: integer('locationId').notNull().references(() => locations.id),
		amount: integer('amount').notNull(),
		expires: text('expires'),
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
	menuFood: one(menuFoods, {
		fields: [inventory.foodId],
		references: [menuFoods.foodId],
		relationName: 'menuFood'
	})
}));

export const recipes = sqliteTable('recipes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	servings: integer('servings').notNull(),
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
	}),
	menuRecipe: one(menuRecipes, {
		fields: [ingredients.recipeId],
		references: [menuRecipes.recipeId],
		relationName: 'menuRecipe'
	})
}));

export const menu = sqliteTable('menu',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		recipeId: integer('recipeId').notNull().references(() => recipes.id),
	}
);

export const menuRelations = relations(menu, ({one}) => ({
	recipe: one(recipes, {
		fields: [menu.recipeId],
		references: [recipes.id]
	})
}));

// Drizzle doesn't currently fully support views. First, it doesn't create
// sqlite views, but handles it internally. Second, relations aren't supported
// on views, so no abstract queries.
//
// In its place, I can create a sqlite view and tell drizzle they are tables.
// So, this implies forgoing drizzle db pushes and migrations and instead doing
// it manually.
//
// The following variables, ending in "_unused_view" are here in hopes that I
// can eventually switch to full view support as drizzle evolves:

export const menuRecipes_unused_view = sqliteView('menuRecipes')
.as((qb) => qb.select({
		recipeId: recipes.id,
		name: recipes.name,
		servings: recipes.servings,
		desciption: recipes.description,
		menuId: menu.id
	}).from(menu)
	.leftJoin(recipes, eq(menu.recipeId, recipes.id)));

export const menuRecipes = sqliteTable('menuRecipes', {
	recipeId: integer('recipeId').notNull().references(() => recipes.id),
	name: text('name').notNull(),
	servings: integer('servings').notNull(),
	description: text('description'),
	id: integer('id').notNull().references(() => menu.id)
});

export const menuRecipesRelations = relations(menuRecipes, ({ many }) => ({
	ingredients: many(ingredients, {
		relationName: 'menuRecipe'
	})
}));

export const menuFoods_unused_errant_view = sqliteView("menuFoods")
.as((qb) => qb.select({
		foodId: ingredients.foodId,
		need: sum(ingredients.amount).as("need"),
		have: sum(inventory.amount).as("have")
	}).from(menu)
	.leftJoin(recipes, eq(menu.recipeId, recipes.id))
	.leftJoin(ingredients, eq(menu.recipeId, ingredients.recipeId))
	.leftJoin(inventory, eq(ingredients.foodId, inventory.foodId))
	.groupBy(ingredients.foodId)
	.orderBy(ingredients.foodId)
);
export const menuFoods = sqliteTable('menuFoods', {
	foodId: integer('foodId').notNull().references(() => foods.id),
	need: integer('need').notNull(),
	have: integer('have').notNull(),
	balance: integer('balance').notNull(),
});
export const menuFoodsRelations = relations(menuFoods, ({ one, many }) => ({
	food: one(foods, {
		fields: [menuFoods.foodId],
		references: [foods.id]
	}),
	inventory: many(inventory, {
		relationName: 'menuFood'
	})
}));
