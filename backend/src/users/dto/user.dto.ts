import { TypeUserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';

// =================================================================
// ENUMS & TYPES
// =================================================================

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export type UserStatusType = typeof USER_STATUSES[keyof typeof USER_STATUSES];

// =================================================================
// SKEMA LOGIN
// =================================================================

export const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
});

// =================================================================
// SKEMA BIODATA & DATA KEPEGAWAIAN
// =================================================================

export const createDosenBiodataSchema = z.object({
  nama: z.string().min(3),
  nip: z.string().optional(),
  nuptk: z.string().optional(),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan']),
  no_hp: z.string().optional(),
  prodiId: z.number().int(),
  fakultasId: z.number().int(),
  jabatan: z.enum(['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar']),
});

export const createValidatorBiodataSchema = z.object({
  nama: z.string().min(3),
  nip: z.string().optional(),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan']),
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

// =================================================================
// SKEMA USER (CREATE / UPDATE)
// =================================================================

export const createUserSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    name: z.string().min(3),
    status: z.nativeEnum(UserStatus).optional(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .transform(({ confirmPassword, ...rest }) => rest);

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
// SKEMA PAGINATION & SEARCH
// =================================================================

export const findAllUsersSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  roles: z.array(z.nativeEnum(TypeUserRole)).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

// =================================================================
// SKEMA USER PROFILE & ROLE RESPONSE
// =================================================================

export const roleDataSchema = z.object({
  id: z.number(),
  name: z.nativeEnum(TypeUserRole),
});

const userRoleSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roleId: z.number(),
  role: roleDataSchema,
});

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

const fakultasSchema = z.object({
  id: z.number(),
  nama: z.string(),
});

const prodiSchema = z.object({
  id: z.number(),
  nama: z.string(),
  fakultasId: z.number().optional(),
});

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
  dataKepegawaian: dataKepegawaianSchema.nullable().optional(),
  fakultas: fakultasSchema.optional(),
  prodi: prodiSchema.optional(),
  pendidikan: z.array(z.any()).optional(),
});

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
  status: z.nativeEnum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  userRoles: z.array(userRoleSchema),
  dosen: dosenResponseSchema.nullable().optional(),
  validator: validatorResponseSchema.nullable().optional(),
});

// =================================================================
// SKEMA UPDATE PROFILE
// =================================================================

const baseUpdateUserSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    name: z.string().min(3),
    status: z.nativeEnum(UserStatus),
    password: z.string().min(8).optional().or(z.literal('')),
    confirmPassword: z.string().min(8).optional().or(z.literal('')),
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
  .transform(({ confirmPassword, ...rest }) => rest);

export const updateAdminProfileSchema = z.object({
  dataUser: baseUpdateUserSchema,
});

export const updateDosenProfileSchema = z.object({
  dataUser: baseUpdateUserSchema,
  biodata: createDosenBiodataSchema,
  dataKepegawaian: createDataKepegawaianSchema.optional(),
});

export const updateValidatorProfileSchema = z.object({
  dataUser: baseUpdateUserSchema,
  biodata: createValidatorBiodataSchema,
});

// =================================================================
// SKEMA PASSWORD & STATUS
// =================================================================

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Password baru harus berbeda dari password lama',
    path: ['newPassword'],
  });

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

// =================================================================
// PAGINATED RESPONSE SCHEMA
// =================================================================

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const paginatedUserResponseSchema = z.object({
  data: z.array(userResponseSchema),
  meta: paginationMetaSchema,
});

// =================================================================
// EKSPOR TYPE
// =================================================================

export type LoginDto = z.infer<typeof loginSchema>;
export type CreateAdminUserDto = z.infer<typeof createAdminUserSchema>;
export type CreateValidatorUserDto = z.infer<typeof createValidatorUserSchema>;
export type CreateDosenUserDto = z.infer<typeof createDosenUserSchema>;
export type FindAllUsersDto = z.infer<typeof findAllUsersSchema>;
export type UpdateDosenProfileDto = z.infer<typeof updateDosenProfileSchema>;
export type UpdateAdminProfileDto = z.infer<typeof updateAdminProfileSchema>;
export type UpdateValidatorProfileDto = z.infer<typeof updateValidatorProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
export type SearchUsersDto = z.infer<typeof searchUsersSchema>;
export type UpdateDataKepegawaianDto = z.infer<typeof dataKepegawaianSchema>;

export type RoleData = z.infer<typeof roleDataSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userResponseSchema>;
export type PaginatedUserResponse = z.infer<typeof paginatedUserResponseSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
