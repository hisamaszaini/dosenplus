export const ROLES = {
  ADMIN: 'ADMIN',
  DOSEN: 'DOSEN',
  VALIDATOR: 'VALIDATOR',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  name: string;
  password: string;
  role?: Role;
  status?: UserStatus;
}

export interface UpdateProfileDto {
  name: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUserStatusDto {
  status: UserStatus;
}

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  role: Role;
  status: UserStatus;
}