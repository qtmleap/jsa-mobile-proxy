-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moves" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "black_time" INTEGER,
    "white_time" INTEGER,
    "location" TEXT,
    "kif" TEXT,
    "date" TEXT NOT NULL,
    "tournament" TEXT,
    "time_limit" INTEGER,
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

-- CreateTable
CREATE TABLE "tags" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "players" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "games_title_idx" ON "games"("title");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTag_AB_unique" ON "_GameToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTag_B_index" ON "_GameToTag"("B");
