import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProdiDto, UpdateProdiDto } from './dto/prodi.dto';

@Injectable()
export class ProdiService {
  constructor(private prisma: PrismaService) {}

  async create(createProdiDto: CreateProdiDto) {
    const { kode, nama } = createProdiDto;

    const existing = await this.prisma.prodi.findFirst({
      where: {
        OR: [{ kode }, { nama }],
      },
    });

    if (existing) {
      if (existing.kode === kode) {
        throw new BadRequestException('Kode prodi sudah digunakan');
      }
      if (existing.nama === nama) {
        throw new BadRequestException('Nama prodi sudah digunakan');
      }
    }

    const created = await this.prisma.prodi.create({
      data: createProdiDto,
    });

    return {
      success: true,
      message: 'Program studi berhasil dibuat',
      data: created,
    };
  }

  async findAll() {
    const data = await this.prisma.prodi.findMany({
      include: { fakultas: true },
    });

    return {
      success: true,
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.prodi.findUnique({ where: { id }, include: { fakultas: true } });

    if (!data) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }

    return {
      success: true,
      data,
    };
  }

  async update(id: number, updateProdiDto: UpdateProdiDto) {
    const { kode, nama } = updateProdiDto;

    if (kode) {
      const existingKode = await this.prisma.prodi.findUnique({ where: { kode } });
      if (existingKode && existingKode.id !== id) {
        throw new BadRequestException('Kode prodi sudah digunakan oleh data lain');
      }
    }

    if (nama) {
      const existingNama = await this.prisma.prodi.findFirst({
        where: {
          nama,
          NOT: { id },
        },
      });

      if (existingNama) {
        throw new BadRequestException('Nama prodi sudah digunakan oleh data lain');
      }
    }

    const updated = await this.prisma.prodi.update({
      where: { id },
      data: updateProdiDto,
    });

    return {
      success: true,
      message: 'Program studi berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: number) {
    const deleted = await this.prisma.prodi.delete({ where: { id } });

    return {
      success: true,
      message: 'Program studi berhasil dihapus',
      data: deleted,
    };
  }
}