/*
  Warnings:

  - You are about to drop the column `name` on the `Fakultas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nama]` on the table `Fakultas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nama` to the `Fakultas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NamaSemester" AS ENUM ('GENAP', 'GANJIL');

-- CreateEnum
CREATE TYPE "Jabatan" AS ENUM ('LEKTOR');

-- CreateEnum
CREATE TYPE "Jenjang" AS ENUM ('S1', 'S2', 'S3');

-- DropIndex
DROP INDEX "Fakultas_name_key";

-- AlterTable
ALTER TABLE "Fakultas" DROP COLUMN "name",
ADD COLUMN     "nama" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Prodi" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "kode" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "NamaSemester" NOT NULL,
    "tahunMulai" INTEGER NOT NULL,
    "tahunSelesai" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameRektor" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dosen" (
    "id" SERIAL NOT NULL,
    "nip" INTEGER NOT NULL,
    "nuptk" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" INTEGER NOT NULL,
    "jabatan" TEXT NOT NULL,
    "npwp" INTEGER NOT NULL,
    "nama_bank" TEXT NOT NULL,
    "no_rek" INTEGER NOT NULL,
    "bpjs_kesehatan" TEXT NOT NULL,
    "bpjs_tkerja" TEXT NOT NULL,
    "no_kk" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendidikan" (
    "id" SERIAL NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "jenjang" "Jenjang" NOT NULL,
    "prodi" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "nama_kampus" TEXT NOT NULL,
    "lulus_tahun" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelaksanaanPendidikan" (
    "id" SERIAL NOT NULL,
    "jenis_kategori" TEXT NOT NULL,
    "jenis_keg" TEXT NOT NULL,
    "sub_keg" TEXT NOT NULL,
    "nilai_pak" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PelaksanaanPendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KegiatanPendidikan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "affiliasi" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "jumlah_mahasiswa" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "bukti" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KegiatanPendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_kode_key" ON "Prodi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_nama_key" ON "Prodi"("nama");

-- CreateIndex
CREATE INDEX "Semester_tipe_idx" ON "Semester"("tipe");

-- CreateIndex
CREATE INDEX "Semester_tahunMulai_tahunSelesai_idx" ON "Semester"("tahunMulai", "tahunSelesai");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_email_key" ON "Dosen"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_no_hp_key" ON "Dosen"("no_hp");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_nama_key" ON "Fakultas"("nama");

-- AddForeignKey
ALTER TABLE "Prodi" ADD CONSTRAINT "Prodi_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendidikan" ADD CONSTRAINT "Pendidikan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KegiatanPendidikan" ADD CONSTRAINT "KegiatanPendidikan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
