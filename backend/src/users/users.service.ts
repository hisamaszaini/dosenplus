import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

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

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createDosenWithUserAccount(dto: CreateDosenUserDto) {
        await this.validateUniqueUser(dto.dataUser.email, dto.dataUser.username);
        await this.validateFakultasProdi(dto.biodata.fakultasId, dto.biodata.prodiId);

        const hashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);

        const role = await this.prisma.role.findUnique({ where: { name: 'DOSEN' } });
        if (!role) {
            throw new BadRequestException('Role DOSEN tidak ditemukan.');
        }

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    name: dto.biodata.nama,
                    password: hashedPassword,
                    status: 'ACTIVE',
                },
            });

            await tx.userRole.create({
                data: {
                    userId: newUser.id,
                    roleId: role.id,
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

            return {
                success: true,
                message: 'Dosen berhasil ditambahkan',
                userData
            };
        });
    }

    async createAdminUser(dto: CreateAdminUserDto) {
        await this.validateUniqueUser(dto.dataUser.email, dto.dataUser.username);

        const hashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);

        const role = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
        if (!role) {
            throw new BadRequestException('Role ADMIN tidak ditemukan.');
        }

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    name: dto.dataUser.name,
                    password: hashedPassword,
                    status: 'ACTIVE',
                },
            });

            await tx.userRole.create({
                data: {
                    userId: newUser.id,
                    roleId: role.id,
                },
            });

            const { password, hashedRefreshToken, ...userData } = newUser;
            return {
                success: true,
                message: 'Admin berhasil ditambahkan',
                userData
            };
        });
    }

    async createValidatorUser(dto: CreateValidatorUserDto) {
        await this.validateUniqueUser(dto.dataUser.email, dto.dataUser.username);

        const hashedPassword = await bcrypt.hash(dto.dataUser.password, SALT_ROUNDS);

        const role = await this.prisma.role.findUnique({ where: { name: 'VALIDATOR' } });
        if (!role) {
            throw new BadRequestException('Role VALIDATOR tidak ditemukan.');
        }

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.dataUser.email,
                    username: dto.dataUser.username,
                    name: dto.dataUser.name,
                    password: hashedPassword,
                    status: 'ACTIVE',
                },
            });

            await tx.userRole.create({
                data: {
                    userId: newUser.id,
                    roleId: role.id,
                },
            });

            await tx.validator.create({
                data: {
                    ...dto.biodata,
                    id: newUser.id,
                },
            });

            const { password, hashedRefreshToken, ...userData } = newUser;
            return {
                success: true,
                message: 'Validator berhasil ditambahkan',
                userData
            };
        });
    }

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
                fakultasId: fakultasId
            },
        });
        if (!prodi) {
            throw new BadRequestException('Program Studi tidak ditemukan atau tidak sesuai dengan fakultas.');
        }
    }

    async findAll(dto: FindAllUsersDto): Promise<any> {
        const {
            page,
            limit,
            search,
            roles,
            status,
        } = dto;

        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (roles && roles.length > 0) {
            whereClause.userRoles = {
                some: {
                    role: {
                        name: {
                            in: roles,
                        },
                    },
                },
            };
        }

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                {
                    dosen: {
                        nip: { contains: search, mode: 'insensitive' },
                    },
                },
                {
                    validator: {
                        nip: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }

        const total = await this.prisma.user.count({
            where: whereClause,
        });

        const users = await this.prisma.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
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
            orderBy: {
                createdAt: 'desc',
            },
        });

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

    async findById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
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
        return { success: true, data: result };
    }

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

        const userData = await this.findById(id);
        return { success: true, message: 'Data berhasil diupdate.', data: userData };
    }

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

        const userData = await this.findById(id);
        return { success: true, message: 'Data berhasil diupdate.', data: userData };
    }

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

        const userData = await this.findById(id);
        return { success: true, message: 'Data berhasil diupdate.', data: userData };
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

    async fixMissingRelationalData() {
        const results = {
            dosenMissing: 0,
            validatorMissing: 0,
            message: 'Data relational yang hilang harus diperbaiki manual karena tidak ada nilai default.',
        };

        const dosenUsers = await this.prisma.user.findMany({
            where: {
                userRoles: {
                    some: {
                        role: {
                            name: 'DOSEN',
                        },
                    },
                },
                dosen: null,
            },
        });
        results.dosenMissing = dosenUsers.length;

        const validatorUsers = await this.prisma.user.findMany({
            where: {
                userRoles: {
                    some: {
                        role: {
                            name: 'VALIDATOR',
                        },
                    },
                },
                validator: null,
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

        return { success: true, message: 'Password berhasil diubah.' };
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

        await this.prisma.user.delete({ where: { id } });

        return { success: true, message: 'User berhasil dihapus!' };
    }

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
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
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