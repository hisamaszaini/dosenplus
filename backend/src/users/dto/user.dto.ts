import { Role, UserStatus } from '@prisma/client';
import { z } from 'zod';

// =================================================================
// SKEMA AUTENTIKASI
// =================================================================

export const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
});

// =================================================================
// SKEMA PENDAFTARAN (CREATE)
// =================================================================

const createDosenBiodataSchema = z.object({
  nama: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter' }),
  nip: z.string().optional(),
  nuptk: z.string().optional(),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan'], { message: 'Jenis kelamin harus Laki-laki atau Perempuan' }),
  no_hp: z.string().optional(),
  prodiId: z.number().int({ message: 'Prodi harus dipilih' }),
  fakultasId: z.number().int({ message: 'Fakultas harus dipilih' }),
  jabatan: z.enum(['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'], {
    message: 'Jabatan harus dipilih',
  }),
  // jabatan: z.string().optional(),
});

const createValidatorBiodataSchema = z.object({
  nama: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter' }),
  nip: z.string().optional(),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan'], { message: 'Jenis kelamin harus Laki-laki atau Perempuan' }),
  no_hp: z.string().optional(),
});

export const createDataKepegawaianSchema = z.object({
  npwp: z.string().optional(),
  nama_bank: z.string().optional(),
  no_rek: z.string().optional(),
  bpjs_kesehatan: z.string().optional(),
  bpjs_tkerja: z.string().optional(),
  no_kk: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
  name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
  status: z.nativeEnum(UserStatus).optional(),
  password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
  confirmPassword: z.string().min(8, { message: 'Konfirmasi password minimal 8 karakter' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password dan konfirmasi password tidak cocok',
  path: ['confirmPassword'],
}).transform(({ confirmPassword, ...rest }) => rest);

export const createAdminUserSchema = z.object({
  dataUser: createUserSchema,
});

export const createValidatorUserSchema = z.object({
  dataUser: createUserSchema,
  biodata: createValidatorBiodataSchema,
});

export const createDosenUserSchema = z.object({
  dataUser: createUserSchema,
  biodata: createDosenBiodataSchema,
  dataKepegawaian: createDataKepegawaianSchema.optional(),
});

// =================================================================
// SKEMA PAGINATION DAN SEARCH
// =================================================================

export const findAllUsersSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

// =================================================================
// SKEMA AKSI PENGGUNA (UPDATE)
// =================================================================

export const updateDosenProfileSchema = z.object({
  dataUser: z.object({
    email: z.string().email({ message: 'Format email tidak valid' }),
    username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
    name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
    status: z.nativeEnum(UserStatus),
    password: z.string().min(8, { message: 'Password minimal 8 karakter' }).optional().or(z.literal('')),
    confirmPassword: z.string().min(8, { message: 'Konfirmasi password minimal 8 karakter' }).optional().or(z.literal('')),
  })
    .refine((data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    }, {
      message: 'Password dan konfirmasi password tidak cocok',
      path: ['confirmPassword'],
    })
    .transform(({ confirmPassword, ...rest }) => rest),

  biodata: createDosenBiodataSchema,
  dataKepegawaian: createDataKepegawaianSchema.optional(),
});

export const updateValidatorProfileSchema = z.object({
  dataUser: z.object({
    email: z.string().email({ message: 'Format email tidak valid' }),
    username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
    name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
    status: z.nativeEnum(UserStatus),
    password: z.string().min(8, { message: 'Password minimal 8 karakter' }).optional().or(z.literal('')),
    confirmPassword: z.string().min(8, { message: 'Konfirmasi password minimal 8 karakter' }).optional().or(z.literal('')),
  })
    .refine((data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    }, {
      message: 'Password dan konfirmasi password tidak cocok',
      path: ['confirmPassword'],
    })
    .transform(({ confirmPassword, ...rest }) => rest),

  biodata: createValidatorBiodataSchema,
});

export const updateAdminProfileSchema = z.object({
  dataUser: z.object({
    email: z.string().email({ message: 'Format email tidak valid' }),
    username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
    name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
    status: z.enum(UserStatus),
    password: z.string().min(8, { message: 'Password minimal 8 karakter' }).optional().or(z.literal('')),
    confirmPassword: z.string().min(8, { message: 'Konfirmasi password minimal 8 karakter' }).optional().or(z.literal('')),
  })
    .refine((data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    }, {
      message: 'Password dan konfirmasi password tidak cocok',
      path: ['confirmPassword'],
    })
    .transform(({ confirmPassword, ...rest }) => rest),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Password lama tidak boleh kosong'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Password baru harus berbeda dengan password lama',
    path: ['newPassword'],
  });

// =================================================================
// SKEMA KHUSUS ADMIN
// =================================================================

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, { message: 'Status tidak valid' }),
});

// Skema untuk data kepegawaian yang di-nest
const dataKepegawaianSchema = z.object({
  id: z.number().optional(),
  npwp: z.string().nullable(),
  nama_bank: z.string().nullable(),
  no_rek: z.string().nullable(),
  bpjs_kesehatan: z.string().nullable(),
  bpjs_tkerja: z.string().nullable(),
  no_kk: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Skema untuk data Fakultas
const fakultasSchema = z.object({
  id: z.number(),
  nama: z.string(),
});

// Skema untuk data Prodi
const prodiSchema = z.object({
  id: z.number(),
  nama: z.string(),
  fakultasId: z.number().optional(),
});

// Skema untuk data Dosen lengkap yang di-nest
const dosenResponseSchema = z.object({
  id: z.number(),
  nama: z.string(),
  nip: z.string().nullable(),
  nuptk: z.string().nullable(),
  jenis_kelamin: z.string(),
  no_hp: z.string().nullable(),
  jabatan: z.string().nullable(),
  prodiId: z.number(),
  fakultasId: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Relasi
  dataKepegawaian: dataKepegawaianSchema.nullable().optional(),
  fakultas: fakultasSchema.optional(),
  prodi: prodiSchema.optional(),
  pendidikan: z.array(z.any()).optional(), // Schema pendidikan bisa didefinisikan lebih detail jika diperlukan
});

// Skema untuk data Validator
const validatorResponseSchema = z.object({
  id: z.number(),
  nama: z.string(),
  nip: z.string().nullable(),
  jenis_kelamin: z.string(),
  no_hp: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  name: z.string(),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Relasi ke Dosen, bisa null jika role bukan Dosen
  dosen: dosenResponseSchema.nullable().optional(),

  // Relasi ke Validator, bisa null jika role bukan Validator
  validator: validatorResponseSchema.nullable().optional(),
});

// Skema untuk pagination metadata
export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Skema untuk response pagination
export const paginatedUserResponseSchema = z.object({
  data: z.array(userResponseSchema),
  meta: paginationMetaSchema,
});

// Skema untuk search response
export const searchUsersSchema = z.object({
  query: z.string().min(1, { message: 'Query pencarian tidak boleh kosong' }),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// =================================================================
// EKSPOR TIPE-TIPE DATA
// =================================================================

export type LoginDto = z.infer<typeof loginSchema>;
export type CreateAdminUserDto = z.infer<typeof createAdminUserSchema>;
export type CreateValidatorUserDto = z.infer<typeof createValidatorUserSchema>;
export type CreateDosenUserDto = z.infer<typeof createDosenUserSchema>;
export type FindAllUsersDto = z.infer<typeof findAllUsersSchema>;
export type UpdateDosenProfileDto = z.infer<typeof updateDosenProfileSchema>;
export type UpdateAdminProfileDto = z.infer<typeof updateAdminProfileSchema>;
export type UpdateValidatorProfileDto = z.infer<typeof updateValidatorProfileSchema>;
export type UpdateDataKepegawaianDto = z.infer<typeof dataKepegawaianSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
export type SearchUsersDto = z.infer<typeof searchUsersSchema>;
export type User = z.infer<typeof userResponseSchema>;
export type PaginatedUserResponse = z.infer<typeof paginatedUserResponseSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;