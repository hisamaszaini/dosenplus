/*
  Warnings:

  - You are about to drop the column `totalPak` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PelaksanaanPendidikan" DROP COLUMN "totalPak",
ADD COLUMN     "jumlahKelas" INTEGER,
ADD COLUMN     "sks" INTEGER;
