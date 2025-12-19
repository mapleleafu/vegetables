-- AlterTable
ALTER TABLE "User" ADD COLUMN     "backgroundWordId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_backgroundWordId_fkey" FOREIGN KEY ("backgroundWordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;
