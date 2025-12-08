/*
  Warnings:

  - You are about to drop the column `maxCoinsPerUser` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "maxCoinsPerUser";

-- AlterTable
ALTER TABLE "CategoryProgress" ADD COLUMN     "lastTestedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Word" ALTER COLUMN "maxCoinsPerUser" SET DEFAULT 10;
