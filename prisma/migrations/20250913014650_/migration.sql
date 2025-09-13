/*
  Warnings:

  - Added the required column `updated_at` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `players` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moves" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "black_time" INTEGER,
    "white_time" INTEGER,
    "location" TEXT,
    "kif" TEXT,
    "date" TEXT NOT NULL,
    "time_limit" INTEGER NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME,
    "black_id" TEXT NOT NULL,
    "white_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "games_black_id_fkey" FOREIGN KEY ("black_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "games_white_id_fkey" FOREIGN KEY ("white_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_games" ("black_id", "black_time", "date", "end_time", "id", "kif", "location", "moves", "start_time", "time_limit", "title", "white_id", "white_time") SELECT "black_id", "black_time", "date", "end_time", "id", "kif", "location", "moves", "start_time", "time_limit", "title", "white_id", "white_time" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
CREATE INDEX "games_title_idx" ON "games"("title");
CREATE TABLE "new_players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_players" ("id", "name") SELECT "id", "name" FROM "players";
DROP TABLE "players";
ALTER TABLE "new_players" RENAME TO "players";
CREATE UNIQUE INDEX "players_name_key" ON "players"("name");
CREATE TABLE "new_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_tags" ("id", "name") SELECT "id", "name" FROM "tags";
DROP TABLE "tags";
ALTER TABLE "new_tags" RENAME TO "tags";
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
