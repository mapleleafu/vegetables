/*
  Warnings:

  - The `languageCode` column on the `WordTranslation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('TR');

-- AlterTable
ALTER TABLE "WordTranslation" DROP COLUMN "languageCode",
ADD COLUMN     "languageCode" "LanguageCode" NOT NULL DEFAULT 'TR';

-- CreateIndex
CREATE UNIQUE INDEX "WordTranslation_wordId_languageCode_key" ON "WordTranslation"("wordId", "languageCode");
