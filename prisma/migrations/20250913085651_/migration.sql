/*
  Warnings:

  - The primary key for the `players` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `players` table. All the data in the column will be lost.
  - The primary key for the `tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tags` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__GameToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__GameToTag" ("A", "B") SELECT "A", "B" FROM "_GameToTag";
DROP TABLE "_GameToTag";
ALTER TABLE "new__GameToTag" RENAME TO "_GameToTag";
CREATE UNIQUE INDEX "_GameToTag_AB_unique" ON "_GameToTag"("A", "B");
CREATE INDEX "_GameToTag_B_index" ON "_GameToTag"("B");
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
    CONSTRAINT "games_black_id_fkey" FOREIGN KEY ("black_id") REFERENCES "players" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "games_white_id_fkey" FOREIGN KEY ("white_id") REFERENCES "players" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_games" ("black_id", "black_time", "created_at", "date", "end_time", "id", "kif", "location", "moves", "start_time", "time_limit", "title", "updated_at", "white_id", "white_time") SELECT "black_id", "black_time", "created_at", "date", "end_time", "id", "kif", "location", "moves", "start_time", "time_limit", "title", "updated_at", "white_id", "white_time" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
CREATE INDEX "games_title_idx" ON "games"("title");
CREATE TABLE "new_players" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_players" ("created_at", "name", "updated_at") SELECT "created_at", "name", "updated_at" FROM "players";
DROP TABLE "players";
ALTER TABLE "new_players" RENAME TO "players";
CREATE TABLE "new_tags" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_tags" ("created_at", "name", "updated_at") SELECT "created_at", "name", "updated_at" FROM "tags";
DROP TABLE "tags";
ALTER TABLE "new_tags" RENAME TO "tags";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
