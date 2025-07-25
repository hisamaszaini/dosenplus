-- DropForeignKey
ALTER TABLE "Dosen" DROP CONSTRAINT "Dosen_userId_fkey";

-- DropForeignKey
ALTER TABLE "Validator" DROP CONSTRAINT "Validator_userId_fkey";

-- AlterTable
ALTER TABLE "Dosen" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Dosen_id_seq";

-- AlterTable
ALTER TABLE "Validator" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Validator_id_seq";

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
