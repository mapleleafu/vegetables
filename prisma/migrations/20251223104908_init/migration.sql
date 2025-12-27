/*
  Warnings:

  - The values [QUICK_NORMAL,QUICK_HARD] on the enum `TestMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TestMode_new" AS ENUM ('CATEGORY', 'QUICK_CATEGORY', 'QUICK_WORDS');
ALTER TABLE "TestSession" ALTER COLUMN "mode" TYPE "TestMode_new" USING ("mode"::text::"TestMode_new");
ALTER TYPE "TestMode" RENAME TO "TestMode_old";
ALTER TYPE "TestMode_new" RENAME TO "TestMode";
DROP TYPE "public"."TestMode_old";
COMMIT;
