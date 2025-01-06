PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `foods` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `name` text NOT NULL,
        `domain` text NOT NULL
);
INSERT INTO foods VALUES(1,'Chicken, Thigh, Boneless Skinless','Q');
INSERT INTO foods VALUES(2,'Butter','V');
INSERT INTO foods VALUES(3,'Oil, Safflower','V');
INSERT INTO foods VALUES(4,'Onion, Sweet','Q');
INSERT INTO foods VALUES(5,'Paprika','V');
INSERT INTO foods VALUES(6,'Wine, White, Dry','V');
INSERT INTO foods VALUES(7,'Mustard, Dijon','V');
INSERT INTO foods VALUES(8,'Creme Fraiche','V');
INSERT INTO foods VALUES(9,'Cheese, Gruyere','V');
INSERT INTO foods VALUES(11,'Salt','V');
INSERT INTO foods VALUES(12,'Ginger, Ground','V');
INSERT INTO foods VALUES(13,'Ginger, Fresh','V');
INSERT INTO foods VALUES(14,'Honey','V');
INSERT INTO foods VALUES(15,'Lemon Juice','V');
INSERT INTO foods VALUES(16,'Soy Sauce, Low Sodium','V');
CREATE TABLE `ingredients` (
        `recipeId` integer NOT NULL,
        `foodId` integer NOT NULL,
        `amount` integer NOT NULL,
        PRIMARY KEY(`foodId`, `recipeId`),
        FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (`foodId`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO ingredients VALUES(1,1,6);
INSERT INTO ingredients VALUES(1,2,216);
INSERT INTO ingredients VALUES(1,3,216);
INSERT INTO ingredients VALUES(1,4,1);
INSERT INTO ingredients VALUES(1,5,12);
INSERT INTO ingredients VALUES(1,6,1728);
INSERT INTO ingredients VALUES(1,7,48);
INSERT INTO ingredients VALUES(1,8,864);
INSERT INTO ingredients VALUES(1,9,1152);
INSERT INTO ingredients VALUES(2,1,4);
INSERT INTO ingredients VALUES(2,11,12);
INSERT INTO ingredients VALUES(2,12,18);
INSERT INTO ingredients VALUES(2,13,72);
INSERT INTO ingredients VALUES(2,14,216);
INSERT INTO ingredients VALUES(2,15,72);
INSERT INTO ingredients VALUES(2,16,72);
CREATE TABLE `inventory` (
        `foodId` integer NOT NULL,
        `locationId` integer NOT NULL,
        `amount` integer NOT NULL,
        'expires' text,
        PRIMARY KEY(`foodId`, `locationId`),
        FOREIGN KEY (`foodId`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO inventory VALUES(1,3,5,'2025-06-01');
INSERT INTO inventory VALUES(1,2,2,'2025-02-01');
CREATE TABLE `locations` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `name` text NOT NULL
);
INSERT INTO locations VALUES(1,'Pantry');
INSERT INTO locations VALUES(2,'Refrigerator');
INSERT INTO locations VALUES(3,'Freezer');
CREATE TABLE `menu` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `recipeId` integer NOT NULL,
        FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO menu VALUES(1,1);
INSERT INTO menu VALUES(2,2);
INSERT INTO menu VALUES(3,1);
CREATE TABLE `recipes` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `name` text NOT NULL,
        `servings` integer NOT NULL,
        `description` text
);
INSERT INTO recipes VALUES(1,'Chicken Gaston Gerard',6,NULL);
INSERT INTO recipes VALUES(2,'Ginger-Honey Chicken',4,NULL);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('recipes',2);
INSERT INTO sqlite_sequence VALUES('foods',16);
INSERT INTO sqlite_sequence VALUES('menu',3);
INSERT INTO sqlite_sequence VALUES('locations',3);
CREATE UNIQUE INDEX `foods_name_unique` ON `foods` (`name`);
CREATE INDEX `ingredientByFood` ON `ingredients` (`foodId`);

CREATE VIEW menuRecipes AS
    SELECT
        menu.id AS id,
        recipes.id AS recipeId,
        recipes.name AS name,
        recipes.servings AS servings,
        recipes.description as description
    FROM menu
    LEFT JOIN recipes ON menu.recipeId = recipes.id;

CREATE VIEW menuFoods AS
    SELECT
        foodId,
        sum(have) AS have,
        sum(need) AS need,
        sum(need) - sum(have) AS balance
    FROM (
        SELECT
            ingredients.foodId AS foodId,
            0 AS have,
            ingredients.amount AS need
        FROM menu
        LEFT JOIN ingredients on ingredients.recipeId = menu.recipeId

        UNION ALL

        SELECT
            inventory.foodId AS foodId,
            inventory.amount AS have,
            0 AS need
        FROM inventory
        WHERE inventory.foodId IN (
            SELECT ingredients.foodId FROM menu
            LEFT JOIN ingredients on ingredients.recipeId = menu.recipeId
        )
    )
    GROUP BY foodId
    ORDER BY foodId;

COMMIT;