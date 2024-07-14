/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Posts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Posts_title_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Posts_title_key" ON "Posts"("title");
