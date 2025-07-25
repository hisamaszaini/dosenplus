import { z } from 'zod';

const dateOnly = z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().datetime().pipe(z.coerce.date()).optional()
);

export const createPendidikanSchema = z.object({
    dosenId: z.coerce.number().positive(),
    kategori: z.enum(['Pendidikan Formal', 'Diklat']),
    kegiatan: z.string().optional(),

    // Pendidikan Formal
    jenjang: z.string().transform(v => (v === '' ? undefined : v)).optional(),
    prodi: z.string().optional(),
    fakultas: z.string().optional(),
    perguruanTinggi: z.string().optional(),
    lulusTahun: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),

    // Diklat
    jenisDiklat: z.string().optional(),
    namaDiklat: z.string().optional(),
    penyelenggara: z.string().optional(),
    peran: z.string().optional(),
    tingkatan: z.enum(['LOKAL', 'REGIONAL', 'NASIONAL', 'INTERNASIONAL']).optional(),
    jumlahJam: z.coerce.number().optional(),
    noSertifikat: z.string().optional(),
    tglSertifikat: z.preprocess(
        v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
        z.string().date().pipe(z.coerce.date()).optional()
    ),
    tempat: z.string().optional(),
    tanggalMulai: z.preprocess(
        v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
        z.string().date().pipe(z.coerce.date()).optional()
    ),
    tanggalSelesai: z.preprocess(
        v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
        z.string().date().pipe(z.coerce.date()).optional()
    ),

    nilaiPak: z.coerce.number().default(0),
}).superRefine((data, ctx) => {
    if (data.kategori === 'Pendidikan Formal') {
        if (!data.jenjang) ctx.addIssue({ path: ['jenjang'], code: z.ZodIssueCode.custom, message: 'Jenjang wajib diisi' });
        if (!data.prodi) ctx.addIssue({ path: ['prodi'], code: z.ZodIssueCode.custom, message: 'Prodi wajib diisi' });
        if (!data.fakultas) ctx.addIssue({ path: ['fakultas'], code: z.ZodIssueCode.custom, message: 'Fakultas wajib diisi' });
        if (!data.perguruanTinggi) ctx.addIssue({ path: ['perguruanTinggi'], code: z.ZodIssueCode.custom, message: 'Perguruan Tinggi wajib diisi' });
        if (!data.lulusTahun) ctx.addIssue({ path: ['lulusTahun'], code: z.ZodIssueCode.custom, message: 'Tahun lulus wajib diisi' });
    }

    if (data.kategori === 'Diklat') {
        if (!data.jenisDiklat) ctx.addIssue({ path: ['jenisDiklat'], code: z.ZodIssueCode.custom, message: 'Jenis diklat wajib diisi' });
        if (!data.namaDiklat) ctx.addIssue({ path: ['namaDiklat'], code: z.ZodIssueCode.custom, message: 'Nama diklat wajib diisi' });
        if (!data.penyelenggara) ctx.addIssue({ path: ['penyelenggara'], code: z.ZodIssueCode.custom, message: 'Penyelenggara wajib diisi' });
        if (!data.peran) ctx.addIssue({ path: ['peran'], code: z.ZodIssueCode.custom, message: 'Peran wajib diisi' });
        if (!data.tingkatan) ctx.addIssue({ path: ['tingkatan'], code: z.ZodIssueCode.custom, message: 'Tingkatan wajib diisi' });
        if (!data.jumlahJam) ctx.addIssue({ path: ['jumlahJam'], code: z.ZodIssueCode.custom, message: 'Jumlah jam wajib diisi' });
        if (!data.tempat) ctx.addIssue({ path: ['tempat'], code: z.ZodIssueCode.custom, message: 'Tempat wajib diisi' });
        if (!data.tanggalMulai) ctx.addIssue({ path: ['tanggalMulai'], code: z.ZodIssueCode.custom, message: 'Tanggal mulai wajib diisi' });
        if (!data.tanggalSelesai) ctx.addIssue({ path: ['tanggalSelesai'], code: z.ZodIssueCode.custom, message: 'Tanggal selesai wajib diisi' });
    }
});

export const findAllQuerySchema = z.object({
  page:      z.coerce.number().min(1).default(1),
  limit:     z.coerce.number().min(1).max(100).default(10),
  search:    z.string().optional(),
  sortBy:    z.enum([
    'kegiatan','jenjang','prodi','fakultas','perguruanTinggi','lulusTahun',
    'jenisDiklat','namaDiklat','penyelenggara','peran','tingkatan','jumlahJam',
    'tglSertifikat','tempat','tanggalMulai','tanggalSelesai','createdAt'
  ]).default('createdAt'),
  sortOrder: z.enum(['asc','desc']).default('desc'),

  kategori:    z.enum(['Pendidikan Formal','Diklat']).optional(),
  jenjang:     z.enum(['Sarjana','Magister','Doktor']).optional(),
  lulusTahun:  z.coerce.number().optional(),
  tingkatan:   z.enum(['LOKAL','REGIONAL','NASIONAL','INTERNASIONAL']).optional(),
}).strict();

export type FindAllQueryDto = z.infer<typeof findAllQuerySchema>;

export type CreatePendidikanDto = z.infer<typeof createPendidikanSchema>;