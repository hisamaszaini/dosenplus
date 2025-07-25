import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

import type {
    ChangePasswordDto,
    CreateDosenUserDto,
    UpdateDataKepegawaianDto,
    UpdateDosenProfileDto,
    UpdateUserStatusDto,
    FindAllUsersDto,
    CreateAdminUserDto,
    CreateValidatorUserDto,
    UpdateValidatorProfileDto,
    UpdateAdminProfileDto,
} from './dto/user.dto';
import { onErrorResumeNextWith } from 'rxjs';

const SALT_ROUNDS = 10;

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create Dosen User dengan biodata wajib
     * Memastikan tidak ada user DOSEN tanpa data dosen
     */
    async createDosenWithUserAccount(dto: CreateDosenUserDto) {
        await this.validateUniqueUser(dto.dataUser.email, dto.dataUser.username);

        await this.validateFakultasProdi(dto.biodata.fakultasId, dto.biodata.prodiId);

        const hashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    name: dto.biodata.nama,
                    password: hashedPassword,
                    role: 'DOSEN',
                },
            });

            const newDosen = await tx.dosen.create({
                data: {
                    ...dto.biodata,
                    id: newUser.id,
                },
            });

            if (dto.dataKepegawaian) {
                await tx.dataKepegawaian.create({
                    data: {
                        ...dto.dataKepegawaian,
                        id: newDosen.id,
                    },
                });
            }

            const { password, hashedRefreshToken, ...userData } = newUser;
            return userData;
        });
    }

    /**
     * Create Admin
     */
    async createAdminUser(dto: CreateAdminUserDto) {
        await this.validateUniqueUser(dto.dataUser.email, dto.dataUser.username);

        const hashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);

        const newUser = await this.prisma.user.create({
            data: {
                email: dto.dataUser.email,
                username: dto.dataUser.username,
                name: dto.dataUser.name,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        const { password, hashedRefreshToken, ...userData } = newUser;
        return userData;
    }

    /**
     * Create Validator
     * Untuk VALIDATOR akan membuat data Validator otomatis
     */
    async createValidatorUser(dto: CreateValidatorUserDto) {
        await this.validateUniqueUser(dto.dataUser.email, dto.dataUser.username);

        const hashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    name: dto.dataUser.name,
                    password: hashedPassword,
                    role: 'VALIDATOR',
                },
            });

            await tx.validator.create({
                data: {
                    ...dto.biodata,
                    id: newUser.id,
                },
            });

            const { password, hashedRefreshToken, ...userData } = newUser;
            return userData;
        });
    }

    /**
     * Validasi unique email dan username
     */
    private async validateUniqueUser(email: string, username: string) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new BadRequestException('Email sudah digunakan.');
            }
            if (existingUser.username === username) {
                throw new BadRequestException('Username sudah digunakan.');
            }
        }
    }

    /**
     * Validasi fakultas dan prodi exists dan sesuai
     */
    private async validateFakultasProdi(fakultasId: number, prodiId: number) {
        const fakultas = await this.prisma.fakultas.findUnique({
            where: { id: fakultasId },
        });
        if (!fakultas) {
            throw new BadRequestException('Fakultas tidak ditemukan.');
        }

        const prodi = await this.prisma.prodi.findUnique({
            where: {
                id: prodiId,
                fakultasId: fakultasId // pastikan prodi berada di fakultas yang benar
            },
        });
        if (!prodi) {
            throw new BadRequestException('Program Studi tidak ditemukan atau tidak sesuai dengan fakultas.');
        }
    }

    /**
     * Find all users dengan informasi role-specific, pagination, dan search
     */
    async findAll(dto: FindAllUsersDto): Promise<PaginatedResult<any>> {
        const {
            page,
            limit,
            search,
            role,
            status,
        } = dto;

        const skip = (page - 1) * limit;

        // Build where clause untuk search dan filter
        const whereClause: any = {};

        // Filter berdasarkan role jika ada
        if (role) {
            whereClause.role = role;
        }

        // Filter berdasarkan status jika ada
        if (status) {
            whereClause.status = status;
        }

        // Search berdasarkan name, email, atau username
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                // Search berdasarkan NIP dosen
                {
                    dosen: {
                        nip: { contains: search, mode: 'insensitive' }
                    }
                },
                // Search berdasarkan NIP validator
                {
                    validator: {
                        nip: { contains: search, mode: 'insensitive' }
                    }
                },
            ];
        }

        // Get total count untuk pagination
        const total = await this.prisma.user.count({
            where: whereClause,
        });

        // Get paginated data
        const users = await this.prisma.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                dosen: {
                    select: {
                        id: true,
                        nip: true,
                        nuptk: true,
                        jenis_kelamin: true,
                        no_hp: true,
                        jabatan: true,
                        fakultas: { select: { id: true, nama: true } },
                        prodi: { select: { id: true, nama: true } }
                    },
                },
                validator: {
                    select: {
                        id: true,
                        nip: true,
                        jenis_kelamin: true,
                        no_hp: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate pagination meta
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
            },
        };
    }

    /**
     * Find user by ID dengan data lengkap sesuai role
     */
    async findById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                dosen: {
                    include: {
                        dataKepegawaian: true,
                        fakultas: true,
                        prodi: true,
                        pendidikan: true,
                    },
                },
                validator: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan.');
        }

        const { password, hashedRefreshToken, ...result } = user;
        return result;
    }

    /**
     * Update profile validator
     */
    async updateValidatorProfile(id: number, dto: UpdateValidatorProfileDto, byAdmin = false) {
        const user = await this.prisma.user.findUnique({ where: { id: id } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        if (byAdmin) {
            const { email, username } = dto.dataUser;
            if (email !== user.email || username !== user.username) {
                await this.validateUniqueUser(email, username);
            }
        }

        let newHashedPassword: string | undefined = undefined;

        if (dto.dataUser.password) {
            newHashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);
        }

        await this.prisma.user.update({
            where: { id: id },
            data: {
                name: dto.dataUser.name,
                ...(byAdmin && {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    status: dto.dataUser.status,
                    ...(newHashedPassword && { password: newHashedPassword }),
                }),
            },
        });

        await this.prisma.validator.update({
            where: { id },
            data: dto.biodata,
        });

        return this.findById(id);
    }

    /**
     * Update profile admin
     */
    async updateAdminProfile(id: number, dto: UpdateAdminProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: id } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        let newHashedPassword: string | undefined = undefined;

        if (dto.dataUser.password) {
            newHashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);
        }

        await this.prisma.user.update({
            where: { id: id },
            data: {
                name: dto.dataUser.name,
                username: dto.dataUser.username,
                email: dto.dataUser.email,
                status: dto.dataUser.status,
                ...(newHashedPassword && { password: newHashedPassword }),
            },
        });

        return this.findById(id);
    }

    /**
     * Update profile dosen
     */
    async updateDosenProfile(id: number, dto: UpdateDosenProfileDto, byAdmin = false) {
        const user = await this.prisma.user.findUnique({ where: { id: id } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        await this.validateFakultasProdi(dto.biodata.fakultasId, dto.biodata.prodiId);

        if (byAdmin) {
            const { email, username } = dto.dataUser;
            if (email !== user.email || username !== user.username) {
                await this.validateUniqueUser(email, username);
            }
        }

        let newHashedPassword: string | undefined = undefined;

        if (dto.dataUser.password) {
            newHashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);
        }

        await this.prisma.user.update({
            where: { id: id },
            data: {
                name: dto.biodata.nama,
                ...(byAdmin && {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    status: dto.dataUser.status,
                    ...(newHashedPassword && { password: newHashedPassword }),
                }),
            },
        });

        await this.prisma.dosen.update({
            where: { id },
            data: dto.biodata,
        });

        if (dto.dataKepegawaian) {
            const dosen = await this.prisma.dosen.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!dosen) throw new NotFoundException('Dosen tidak ditemukan.');

            await this.prisma.dataKepegawaian.upsert({
                where: { id: dosen.id },
                update: dto.dataKepegawaian,
                create: {
                    ...dto.dataKepegawaian,
                    id: dosen.id,
                },
            });
        }

        return this.findById(id);
    }

    async updateDataKepegawaian(id: number, data: UpdateDataKepegawaianDto) {
        const dosen = await this.prisma.dosen.findUnique({
            where: { id: id },
        });

        if (!dosen) {
            throw new NotFoundException('Dosen tidak ditemukan.');
        }

        return this.prisma.dataKepegawaian.upsert({
            where: { id: id },
            update: { ...data },
            create: { ...data, id: id },
        });
    }

    /**
     * Method untuk memastikan konsistensi data
     * Buat data dosen/validator yang hilang (TIDAK ADA DEFAULT VALUES)
     */
    async fixMissingRelationalData() {
        const results = {
            dosenMissing: 0,
            validatorMissing: 0,
            message: 'Data relational yang hilang harus diperbaiki manual karena tidak ada nilai default.',
        };

        // Hitung missing dosen data
        const dosenUsers = await this.prisma.user.findMany({
            where: {
                role: 'DOSEN',
                dosen: null
            },
        });
        results.dosenMissing = dosenUsers.length;

        // Hitung missing validator data
        const validatorUsers = await this.prisma.user.findMany({
            where: {
                role: 'VALIDATOR',
                validator: null
            },
        });
        results.validatorMissing = validatorUsers.length;

        return results;
    }

    async changePassword(id: number, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: id } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        const passwordMatches = await bcrypt.compare(dto.oldPassword, user.password);
        if (!passwordMatches) throw new UnauthorizedException('Password lama salah.');

        const newHashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: id },
            data: { password: newHashedPassword },
        });

        return { message: 'Password berhasil diubah.' };
    }

    async updateUserStatus(userIdToUpdate: number, dto: UpdateUserStatusDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userIdToUpdate },
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan.');
        }

        return this.prisma.user.update({
            where: { id: userIdToUpdate },
            data: { status: dto.status },
        });
    }

    async remove(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan.');
        }

        return this.prisma.user.delete({ where: { id } });
    }

    /**
     * Search users berdasarkan berbagai kriteria
     */
    async searchUsers(query: string, limit: number = 10) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { username: { contains: query, mode: 'insensitive' } },
                    {
                        dosen: {
                            OR: [
                                { nama: { contains: query, mode: 'insensitive' } },
                                { nip: { contains: query, mode: 'insensitive' } },
                            ]
                        }
                    },
                    {
                        validator: {
                            OR: [
                                { nama: { contains: query, mode: 'insensitive' } },
                                { nip: { contains: query, mode: 'insensitive' } },
                            ]
                        }
                    },
                ],
            },
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                status: true,
                dosen: {
                    select: {
                        nip: true,
                        fakultas: { select: { nama: true } },
                        prodi: { select: { nama: true } }
                    }
                },
                validator: {
                    select: {
                        nip: true,
                    }
                }
            },
        });
    }
}