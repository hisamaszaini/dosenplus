import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFakultasDto, UpdateFakultasDto } from './dto/fakultas.dto';

@Injectable()
export class FakultasService {
    constructor(private prisma: PrismaService) {}

    async create(createFakultasDto: CreateFakultasDto) {
        const existingKode = await this.prisma.fakultas.findUnique({
            where: { kode: createFakultasDto.kode },
        });

        if (existingKode) {
            throw new BadRequestException('Kode fakultas sudah digunakan');
        }

        const existingNama = await this.prisma.fakultas.findFirst({
            where: { nama: createFakultasDto.nama },
        });

        if (existingNama) {
            throw new BadRequestException('Nama fakultas sudah digunakan');
        }

        return this.prisma.fakultas.create({ data: createFakultasDto });
    }

    findAll() {
        return this.prisma.fakultas.findMany();
    }

    findOne(id: number) {
        return this.prisma.fakultas.findUniqueOrThrow({ where: { id } });
    }

    async update(id: number, updateFakultasDto: UpdateFakultasDto) {
        if (updateFakultasDto.kode) {
            const existingKode = await this.prisma.fakultas.findUnique({
                where: { kode: updateFakultasDto.kode },
            });

            if (existingKode && existingKode.id !== id) {
                throw new BadRequestException('Kode fakultas sudah digunakan oleh data lain');
            }
        }

        if (updateFakultasDto.nama) {
            const existingNama = await this.prisma.fakultas.findFirst({
                where: {
                    nama: updateFakultasDto.nama,
                    NOT: { id },
                },
            });

            if (existingNama) {
                throw new BadRequestException('Nama fakultas sudah digunakan oleh data lain');
            }
        }

        return this.prisma.fakultas.update({
            where: { id },
            data: updateFakultasDto,
        });
    }

    remove(id: number) {
        return this.prisma.fakultas.delete({ where: { id } });
    }
}
