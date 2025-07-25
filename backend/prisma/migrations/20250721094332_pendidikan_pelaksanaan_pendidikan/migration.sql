/*
  Warnings:

  - You are about to drop the column `jenis_kategori` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_keg` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `nilai_pak` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `sub_keg` on the `PelaksanaanPendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `lulus_tahun` on the `Pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `nama_kampus` on the `Pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Pendidikan` table. All the data in the column will be lost.
  - The `jenjang` column on the `Pendidikan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `KegiatanPendidikan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dosenId` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileBukti` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenisKegiatan` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategori` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nilaiPak` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodiId` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterId` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PelaksanaanPendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategori` to the `Pendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nilaiPak` to the `Pendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pendidikan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KegiatanPendidikan" DROP CONSTRAINT "KegiatanPendidikan_semesterId_fkey";

-- AlterTable
ALTER TABLE "PelaksanaanPendidikan" DROP COLUMN "jenis_kategori",
DROP COLUMN "jenis_keg",
DROP COLUMN "nilai_pak",
DROP COLUMN "sub_keg",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dosenId" INTEGER NOT NULL,
ADD COLUMN     "fileBukti" TEXT NOT NULL,
ADD COLUMN     "jabatanFungsional" TEXT,
ADD COLUMN     "jenisKegiatan" TEXT NOT NULL,
ADD COLUMN     "jumlah" INTEGER,
ADD COLUMN     "kategori" TEXT NOT NULL,
ADD COLUMN     "mataKuliah" TEXT,
ADD COLUMN     "nilaiPak" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "peran" TEXT,
ADD COLUMN     "prodiId" INTEGER NOT NULL,
ADD COLUMN     "satuan" TEXT,
ADD COLUMN     "semesterId" INTEGER NOT NULL,
ADD COLUMN     "tanggalMulai" TIMESTAMP(3),
ADD COLUMN     "tanggalSelesai" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Pendidikan" DROP COLUMN "lulus_tahun",
DROP COLUMN "nama_kampus",
DROP COLUMN "updateAt",
ADD COLUMN     "jenisDiklat" TEXT,
ADD COLUMN     "jumlahJam" INTEGER,
ADD COLUMN     "kategori" TEXT NOT NULL,
ADD COLUMN     "kegiatan" TEXT,
ADD COLUMN     "lulusTahun" INTEGER,
ADD COLUMN     "namaDiklat" TEXT,
ADD COLUMN     "nilaiPak" INTEGER NOT NULL,
ADD COLUMN     "noSertifikat" TEXT,
ADD COLUMN     "penyelenggara" TEXT,
ADD COLUMN     "peran" TEXT,
ADD COLUMN     "perguruanTinggi" TEXT,
ADD COLUMN     "tanggalMulai" TIMESTAMP(3),
ADD COLUMN     "tanggalSelesai" TIMESTAMP(3),
ADD COLUMN     "tempat" TEXT,
ADD COLUMN     "tglSertifikat" TIMESTAMP(3),
ADD COLUMN     "tingkatan" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "jenjang",
ADD COLUMN     "jenjang" TEXT,
ALTER COLUMN "prodi" DROP NOT NULL,
ALTER COLUMN "fakultas" DROP NOT NULL;

-- DropTable
DROP TABLE "KegiatanPendidikan";

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
