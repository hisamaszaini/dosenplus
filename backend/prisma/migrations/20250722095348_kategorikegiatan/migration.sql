/*
  Warnings:

  - The values [PENGUJI,PEMBINA_MAHASISWA,BAHAN_AJAR,PENGEMBANGAN_PROGRAM_KULIAH] on the enum `KategoriKegiatan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "KategoriKegiatan_new" AS ENUM ('PERKULIAHAN', 'BIMBINGAN_SEMINAR', 'BIMBINGAN_TUGAS_AKHIR', 'BIMBINGAN_KKN', 'PENGUJI_UJIAN_AKHIR', 'PEMBINA_KEGIATAN_MHS', 'PENGEMBANGAN_PROGRAM', 'BAHAN_PENGAJARAN', 'ORASI_ILMIAH', 'JABATAN_STRUKTURAL', 'BIMBING_DOSEN', 'DATA_SERING', 'PENGEMBANGAN_DIRI');
ALTER TABLE "PelaksanaanPendidikan" ALTER COLUMN "kategori" TYPE "KategoriKegiatan_new" USING ("kategori"::text::"KategoriKegiatan_new");
ALTER TYPE "KategoriKegiatan" RENAME TO "KategoriKegiatan_old";
ALTER TYPE "KategoriKegiatan_new" RENAME TO "KategoriKegiatan";
DROP TYPE "KategoriKegiatan_old";
COMMIT;
