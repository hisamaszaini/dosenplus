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

// Login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// Create & Update DTO
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

// User Role Mapping
export interface RoleData {
  id: number;
  name: Role;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  role: RoleData;
}

// User Interface (RESPONSE BACKEND /users/profile)
export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  status: UserStatus;
  userRoles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
  dosen?: any;
  validator?: any;
}

// Extract Role dari Backend
export const extractRoles = (user: User): Role[] =>
  user.userRoles.map((ur) => ur.role.name);
