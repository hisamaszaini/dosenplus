import { file, z } from 'zod'

const JabatanFungsionalEnum = z.enum(['ASISTEN_AHLI', 'LEKTOR', 'LEKTOR_KEPALA', 'GURU_BESAR']);
const KategoriKegiatanEnum = z.enum([
  'PERKULIAHAN',
  'BIMBINGAN_SEMINAR',
  'BIMBINGAN_KKN',
  'BIMBINGAN_TUGAS_AKHIR',
  'PENGUJI_UJIAN_AKHIR',
  'PEMBINA_KEGIATAN_MHS',
  'PENGEMBANGAN_PROGRAM',
  'BAHAN_PENGAJARAN',
  'ORASI_ILMIAH',
  'JABATAN_STRUKTURAL',
  'BIMBING_DOSEN',
  'DATA_SERING',
  'PENGEMBANGAN_DIRI',
]);

const fileSchema = z
  .any()
  .refine((file) => file && typeof file === 'object' && file.originalname?.endsWith('.pdf'), {
    message: 'File harus berupa PDF',
  });

export const perkuliahanSchema = z.object({
  mataKuliah: z.string().min(1),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  fakultasId: z.preprocess((val) => Number(val), z.number()),
  sks: z.preprocess((val) => Number(val), z.number()),
  // jabatanFungsional: JabatanFungsionalEnum,
  jumlahKelas: z.preprocess((val) => Number(val), z.number().min(1)),
  totalSks: z.preprocess((val) => Number(val), z.number().min(1)),
  file: fileSchema,
});

export const seminarMahasiswaSchema = z.object({
  namaKegiatan: z.string().min(1),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  fakultasId: z.preprocess((val) => Number(val), z.number()),
  jumlahMhs: z.preprocess((val) => Number(val), z.number().min(1)),
  file: fileSchema,
});

export const MembimbingKKN_PKN_PKLSchema = z.object({
  namaKegiatan: z.string().min(1),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  jenisKegiatan: z.enum(['KKN', 'PKN', 'PKL']),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  fakultasId: z.preprocess((val) => Number(val), z.number()),
  jumlahMhs: z.preprocess((val) => Number(val), z.number().min(1)),
  file: fileSchema,
});

export const bimbinganTugasAkhirSchema = z.object({
  namaKegiatan: z.string().min(1),
  jenisTugasAkhir: z.enum(['Disertasi', 'Tesis', 'Skripsi', 'Laporan Studi Akhir']),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  peran: z.enum(['Pembimbing Utama', 'Pembimbing Pendamping']),
  jumlahMhs: z.preprocess((val) => Number(val), z.number().min(1)),
  file: fileSchema,
});

export const pengujiUjianSchema = z.object({
  namaKegiatan: z.string().min(1),
  peran: z.enum(['Ketua Penguji', 'Anggota Penguji']),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  jumlahMhs: z.preprocess((val) => Number(val), z.number().min(1)),
  file: fileSchema,
});

export const pembinaMahasiswaSchema = z.object({
  namaKegiatan: z.string().min(1),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  jumlahMhs: z.preprocess((val) => Number(val), z.number()),
  luaranProduk: z.string().min(1),
  file: fileSchema,
});

export const pengembanganProgramKuliahSchema = z.object({
  namaKegiatan: z.string().min(1),
  semesterId: z.preprocess((val) => Number(val), z.number()),
  namaProgram: z.string().min(1, { message: 'Wajib diisi' }),
  mataKuliah: z.string().min(1),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  fakultasId: z.preprocess((val) => Number(val), z.number()),
  file: fileSchema,
});

export const bahanAjarSchema = z.discriminatedUnion('jenisProduk', [
  z.object({
    jenisProduk: z.literal('Buku Ajar'),
    semesterId: z.preprocess((val) => Number(val), z.number()),
    judul: z.string().min(1),
    tglTerbit: z.string(),
    penerbit: z.string().min(1),
    jumlahHalaman: z.preprocess((val) => Number(val), z.number()),
    isbn: z.string().optional(),
    bukti: fileSchema,
  }),
  z.object({
    jenisProduk: z.enum([
      'Diktat',
      'Modul',
      'Petunjuk praktikum',
      'Model',
      'Alat bantu',
      'Audio visual',
      'Naskah tutorial',
      'Job sheet praktikum',
    ]),
    semesterId: z.preprocess((val) => Number(val), z.number()),
    judul: z.string(),
    jumlahHalaman: z.preprocess((val) => Number(val), z.number()),
    prodiId: z.preprocess((val) => Number(val), z.number()),
    fakultasId: z.preprocess((val) => Number(val), z.number()),
    mataKuliah: z.string(),
    bukti: fileSchema,
  }),
]);

export const orasiIlmiahSchema = z.object({
  semesterId: z.preprocess((val) => Number(val), z.number()),
  judulMakalah: z.string().min(1),
  namaPertemuan: z.string().min(1),
  tingkat: z.enum(['Lokal', 'Daerah', 'Nasional', 'Internasional']),
  penyelenggara: z.string().min(1),
  tanggal: z.string(),
  file: fileSchema,
});

export const jabatanStrukturalSchema = z.object({
  semesterId: z.preprocess((val) => Number(val), z.number()),
  namaJabatan: z.enum([
    'Rektor', 'Wakil Rektor', 'Ketua Sekolah', 'Pembantu Ketua Sekolah',
    'Direktur Akademi', 'Pembantu Direktur', 'Sekretaris Jurusan',
  ]),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  fakultasId: z.preprocess((val) => Number(val), z.number()),
  perguruanTinggi: z.string(),
  file: fileSchema,
});

export const bimbingDosenSchema = z.object({
  semesterId: z.preprocess((val) => Number(val), z.number()),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  tglMulai: z.string(),
  tglSelesai: z.string(),
  jenisBimbingan: z.enum(['Reguler', 'Pencangkokan']),
  jabatanFungsional: JabatanFungsionalEnum,
  dosenPembimbing: z.string(),
  bidangKeahlian: z.string(),
  deskripsi: z.string(),
  bukti: fileSchema,
});

export const dataseringSchema = z.object({
  semesterId: z.preprocess((val) => Number(val), z.number()),
  perguruanTinggi: z.string(),
  tglMulai: z.string(),
  tglSelesai: z.string(),
  bidangKeahlian: z.string(),
  bukti: fileSchema,
});

export const pengembanganDiriSchema = z.object({
  semesterId: z.preprocess((val) => Number(val), z.number()),
  prodiId: z.preprocess((val) => Number(val), z.number()),
  fakultasId: z.preprocess((val) => Number(val), z.number()),
  namaKegiatan: z.string(),
  detailKegiatan: z.string(),
  tglMulai: z.string(),
  tglSelesai: z.string(),
  penyelenggara: z.string(),
  tempat: z.string(),
  lamaJam: z.preprocess((val) => Number(val), z.number()),
  bukti: fileSchema,
});

export const pelaksanaanSchemas = {
  PERKULIAHAN: perkuliahanSchema,
  BIMBINGAN_SEMINAR: seminarMahasiswaSchema,
  BIMBINGAN_KKN: MembimbingKKN_PKN_PKLSchema ,
  BIMBINGAN_TUGAS_AKHIR: bimbinganTugasAkhirSchema,
  PENGUJI_UJIAN_AKHIR: pengujiUjianSchema,
  PEMBINA_KEGIATAN_MHS: pembinaMahasiswaSchema,
  PENGEMBANGAN_PROGRAM: pengembanganProgramKuliahSchema,
  BAHAN_PENGAJARAN: bahanAjarSchema,
  ORASI_ILMIAH: orasiIlmiahSchema,
  JABATAN_STRUKTURAL: jabatanStrukturalSchema,
  BIMBING_DOSEN: bimbingDosenSchema,
  DATA_SERING: dataseringSchema,
  PENGEMBANGAN_DIRI: pengembanganDiriSchema,
} as const

export type KategoriKegiatanKey = keyof typeof pelaksanaanSchemas
