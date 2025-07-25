import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProdiDto, UpdateProdiDto } from './dto/prodi.dto';

@Injectable()
export class ProdiService {
    constructor(private prisma: PrismaService) {}

    async create(createProdiDto: CreateProdiDto) {
        const existingKode = await this.prisma.prodi.findUnique({
            where: { kode: createProdiDto.kode },
        });

        if (existingKode) {
            throw new BadRequestException('Kode prodi sudah digunakan');
        }

        const existingNama = await this.prisma.prodi.findFirst({
            where: { nama: createProdiDto.nama },
        });

        if (existingNama) {
            throw new BadRequestException('Nama prodi sudah digunakan');
        }

        return this.prisma.prodi.create({ data: createProdiDto });
    }

    findAll() {
        return this.prisma.prodi.findMany({
            include: { fakultas: true },
        });
    }

    findOne(id: number) {
        return this.prisma.prodi.findUniqueOrThrow({ where: { id } });
    }

    async update(id: number, updateProdiDto: UpdateProdiDto) {
        if (updateProdiDto.kode) {
            const existingKode = await this.prisma.prodi.findUnique({
                where: { kode: updateProdiDto.kode },
            });

            if (existingKode && existingKode.id !== id) {
                throw new BadRequestException('Kode prodi sudah digunakan oleh data lain');
            }
        }

        if (updateProdiDto.nama) {
            const existingNama = await this.prisma.prodi.findFirst({
                where: {
                    nama: updateProdiDto.nama,
                    NOT: { id },
                },
            });

            if (existingNama) {
                throw new BadRequestException('Nama prodi sudah digunakan oleh data lain');
            }
        }

        return this.prisma.prodi.update({
            where: { id },
            data: updateProdiDto,
        });
    }

    remove(id: number) {
        return this.prisma.prodi.delete({ where: { id } });
    }
}
