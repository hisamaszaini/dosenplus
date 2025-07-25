/*
  Warnings:

  - You are about to drop the column `bpjs_kesehatan` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `bpjs_tkerja` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `nama_bank` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `no_kk` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `no_rek` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `npwp` on the `Dosen` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nip]` on the table `Dosen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nuptk]` on the table `Dosen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Dosen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Dosen` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Dosen_email_key";

-- AlterTable
ALTER TABLE "Dosen" DROP COLUMN "bpjs_kesehatan",
DROP COLUMN "bpjs_tkerja",
DROP COLUMN "email",
DROP COLUMN "nama_bank",
DROP COLUMN "no_kk",
DROP COLUMN "no_rek",
DROP COLUMN "npwp",
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "nip" DROP NOT NULL,
ALTER COLUMN "nip" SET DATA TYPE TEXT,
ALTER COLUMN "nuptk" DROP NOT NULL,
ALTER COLUMN "nuptk" SET DATA TYPE TEXT,
ALTER COLUMN "no_hp" DROP NOT NULL,
ALTER COLUMN "no_hp" SET DATA TYPE TEXT,
ALTER COLUMN "jabatan" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DataKepegawaian" (
    "id" SERIAL NOT NULL,
    "npwp" TEXT,
    "nama_bank" TEXT,
    "no_rek" TEXT,
    "bpjs_kesehatan" TEXT,
    "bpjs_tkerja" TEXT,
    "no_kk" TEXT,
    "dosenId" INTEGER NOT NULL,

    CONSTRAINT "DataKepegawaian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataKepegawaian_npwp_key" ON "DataKepegawaian"("npwp");

-- CreateIndex
CREATE UNIQUE INDEX "DataKepegawaian_dosenId_key" ON "DataKepegawaian"("dosenId");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nip_key" ON "Dosen"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nuptk_key" ON "Dosen"("nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_userId_key" ON "Dosen"("userId");

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataKepegawaian" ADD CONSTRAINT "DataKepegawaian_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
