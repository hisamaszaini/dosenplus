import api from './api';
import type {
  ChangePasswordDto,
  CreateAdminUserDto,
  CreateDosenUserDto,
  CreateValidatorUserDto,
  UpdateAdminProfileDto,
  UpdateDosenProfileDto,
  UpdateValidatorProfileDto,
  UpdateDataKepegawaianDto,
  UpdateUserStatusDto,
} from '../../../backend/src/users/dto/user.dto';

// ==============================
// ========== Tipe =============
// ==============================

export type FindAllUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'ADMIN' | 'DOSEN' | 'VALIDATOR';
  status?: 'ACTIVE' | 'INACTIVE';
};

// ==============================
// = Manajemen oleh ADMIN ======
// ==============================

export const getAllUsers = async (params?: FindAllUsersParams) => {
  const { data } = await api.get('/users', { params });
  return data;
};

export const searchUsers = async (query: string) => {
  const { data } = await api.get('/users/search', { params: { q: query } });
  return data;
};

export const getUserById = async (id: number) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const createDosenUser = async (dto: CreateDosenUserDto) => {
  const { data } = await api.post('/users/dosen', dto);
  return data;
};

export const createAdminUser = async (dto: CreateAdminUserDto) => {
  const { data } = await api.post('/users/admin', dto);
  return data;
};

export const createValidatorUser = async (dto: CreateValidatorUserDto) => {
  const { data } = await api.post('/users/validator', dto);
  return data;
};

export const updateDosenProfile = async (id: number, dto: UpdateDosenProfileDto) => {
  const { data } = await api.patch(`/users/${id}/profile/dosen`, dto);
  return data;
};

export const updateAdminProfile = async (id: number, dto: UpdateAdminProfileDto) => {
  const { data } = await api.patch(`/users/${id}/profile/admin`, dto);
  return data;
};

export const updateValidatorProfile = async (id: number, dto: UpdateValidatorProfileDto) => {
  const { data } = await api.patch(`/users/${id}/profile/validator`, dto);
  return data;
};

export const updateUserStatus = async (id: number, dto: UpdateUserStatusDto) => {
  const { data } = await api.patch(`/users/${id}/status`, dto);
  return data;
};

export const updateDataKepegawaian = async (
  dosenId: number,
  dto: UpdateDataKepegawaianDto,
) => {
  const { data } = await api.patch(`/users/dosen/${dosenId}/kepegawaian`, dto);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const checkDataIntegrity = async () => {
  const { data } = await api.get('/users/maintenance/check-integrity');
  return data;
};

// ==============================
// = Profil Pribadi ============
// ==============================

export const getMyProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateMyDosenProfile = async (dto: UpdateDosenProfileDto) => {
  const { data } = await api.patch('/users/profile/dosen', dto);
  return data;
};

export const updateMyAdminProfile = async (dto: UpdateAdminProfileDto) => {
  const { data } = await api.patch('/users/profile/admin', dto);
  return data;
};

export const updateMyValidatorProfile = async (dto: UpdateValidatorProfileDto) => {
  const { data } = await api.patch('/users/profile/validator', dto);
  return data;
};

export const changeMyPassword = async (dto: ChangePasswordDto) => {
  const { data } = await api.patch('/users/profile/password', dto);
  return data;
};