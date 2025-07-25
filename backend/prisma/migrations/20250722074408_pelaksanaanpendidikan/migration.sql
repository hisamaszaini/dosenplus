/*
  Warnings:

  - You are about to drop the column `jenisKegiatan` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `mataKuliah` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `peran` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `satuan` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalMulai` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalSelesai` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - The `jabatanFungsional` column on the `PelaksanaanPendidikan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updateAt` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `kategori` on the `PelaksanaanPendidikan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "KategoriKegiatan" AS ENUM ('PERKULIAHAN', 'BIMBINGAN_SEMINAR', 'BIMBINGAN_TUGAS_AKHIR', 'BIMBINGAN_KKN', 'PENGUJI', 'PEMBINA_MAHASISWA', 'BAHAN_AJAR', 'ORASI_ILMIAH', 'JABATAN_STRUKTURAL', 'BIMBING_DOSEN', 'DATA_SERING', 'PENGEMBANGAN_DIRI');

-- CreateEnum
CREATE TYPE "JenisKegiatan" AS ENUM ('DOSEN_PEMBIMBING', 'DOSEN_PENGUJI', 'PEMBINA', 'PENULIS_BUKU', 'NARASUMBER', 'PENGEMBANGAN');

-- CreateEnum
CREATE TYPE "JabatanFungsional" AS ENUM ('ASISTEN_AHLI', 'LEKTOR', 'LEKTOR_KEPALA', 'GURU_BESAR');

-- DropForeignKey
ALTER TABLE "PelaksanaanPendidikan" DROP CONSTRAINT "PelaksanaanPendidikan_prodiId_fkey";

-- AlterTable
ALTER TABLE "PelaksanaanPendidikan" DROP COLUMN "jenisKegiatan",
DROP COLUMN "mataKuliah",
DROP COLUMN "peran",
DROP COLUMN "satuan",
DROP COLUMN "tanggalMulai",
DROP COLUMN "tanggalSelesai",
DROP COLUMN "updatedAt",
ADD COLUMN     "deskripsi" TEXT,
ADD COLUMN     "fakultasId" INTEGER,
ADD COLUMN     "jenis" "JenisKegiatan",
ADD COLUMN     "namaKegiatan" TEXT,
ADD COLUMN     "perguruanTinggi" TEXT,
ADD COLUMN     "subJenis" TEXT,
ADD COLUMN     "tglMulai" TIMESTAMP(3),
ADD COLUMN     "tglSelesai" TIMESTAMP(3),
ADD COLUMN     "totalPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "fileBukti" DROP NOT NULL,
DROP COLUMN "jabatanFungsional",
ADD COLUMN     "jabatanFungsional" "JabatanFungsional",
DROP COLUMN "kategori",
ADD COLUMN     "kategori" "KategoriKegiatan" NOT NULL,
ALTER COLUMN "nilaiPak" SET DEFAULT 0,
ALTER COLUMN "prodiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
