/*
  Warnings:

  - You are about to drop the column `dosenId` on the `DataKepegawaian` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Validator` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DataKepegawaian" DROP CONSTRAINT "DataKepegawaian_dosenId_fkey";

-- DropIndex
DROP INDEX "DataKepegawaian_dosenId_key";

-- DropIndex
DROP INDEX "Dosen_userId_key";

-- DropIndex
DROP INDEX "Validator_userId_key";

-- AlterTable
ALTER TABLE "DataKepegawaian" DROP COLUMN "dosenId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "DataKepegawaian_id_seq";

-- AlterTable
ALTER TABLE "Dosen" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "DataKepegawaian" ADD CONSTRAINT "DataKepegawaian_id_fkey" FOREIGN KEY ("id") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
