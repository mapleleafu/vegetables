/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Word_name_key" ON "Word"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Word_slug_key" ON "Word"("slug");
