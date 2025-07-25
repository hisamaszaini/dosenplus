/*
  Warnings:

  - You are about to drop the column `fileBukti` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - Added the required column `file` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "KategoriKegiatan" ADD VALUE 'PENGEMBANGAN_PROGRAM_KULIAH';

-- AlterTable
ALTER TABLE "PelaksanaanPendidikan" DROP COLUMN "fileBukti",
ADD COLUMN     "file" TEXT NOT NULL;
