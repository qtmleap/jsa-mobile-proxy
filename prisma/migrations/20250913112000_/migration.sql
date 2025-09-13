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
    "black_rank" TEXT,
    "white_rank" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "games_black_id_fkey" FOREIGN KEY ("black_id") REFERENCES "players" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "games_white_id_fkey" FOREIGN KEY ("white_id") REFERENCES "players" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_games" ("black_id", "black_rank", "black_time", "created_at", "date", "end_time", "id", "kif", "location", "moves", "start_time", "time_limit", "title", "updated_at", "white_id", "white_rank", "white_time") SELECT "black_id", "black_rank", "black_time", "created_at", "date", "end_time", "id", "kif", "location", "moves", "start_time", "time_limit", "title", "updated_at", "white_id", "white_rank", "white_time" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
CREATE INDEX "games_title_idx" ON "games"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
