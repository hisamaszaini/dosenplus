import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFakultasDto, UpdateFakultasDto } from './dto/fakultas.dto';

@Injectable()
export class FakultasService {
  constructor(private prisma: PrismaService) {}

  async create(createFakultasDto: CreateFakultasDto) {
    const { kode, nama } = createFakultasDto;

    const existing = await this.prisma.fakultas.findFirst({
      where: {
        OR: [{ kode }, { nama }],
      },
    });

    if (existing) {
      if (existing.kode === kode) {
        throw new BadRequestException('Kode fakultas sudah digunakan');
      }
      if (existing.nama === nama) {
        throw new BadRequestException('Nama fakultas sudah digunakan');
      }
    }

    const created = await this.prisma.fakultas.create({
      data: createFakultasDto,
    });

    return {
      success: true,
      message: 'Fakultas berhasil dibuat',
      data: created,
    };
  }

  async findAll() {
    const data = await this.prisma.fakultas.findMany();

    return {
      success: true,
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.fakultas.findUnique({ where: { id } });

    if (!data) {
      throw new NotFoundException('Fakultas tidak ditemukan');
    }

    return {
      success: true,
      data,
    };
  }

  async update(id: number, updateFakultasDto: UpdateFakultasDto) {
    const { kode, nama } = updateFakultasDto;

    if (kode) {
      const existingKode = await this.prisma.fakultas.findUnique({
        where: { kode },
      });

      if (existingKode && existingKode.id !== id) {
        throw new BadRequestException('Kode fakultas sudah digunakan oleh data lain');
      }
    }

    if (nama) {
      const existingNama = await this.prisma.fakultas.findFirst({
        where: {
          nama,
          NOT: { id },
        },
      });

      if (existingNama) {
        throw new BadRequestException('Nama fakultas sudah digunakan oleh data lain');
      }
    }

    const updated = await this.prisma.fakultas.update({
      where: { id },
      data: updateFakultasDto,
    });

    return {
      success: true,
      message: 'Fakultas berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.fakultas.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Fakultas tidak ditemukan');
    }

    const deleted = await this.prisma.fakultas.delete({ where: { id } });

    return {
      success: true,
      message: 'Fakultas berhasil dihapus',
      data: deleted,
    };
  }
}