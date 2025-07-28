import { Prisma } from '@prisma/client';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

type StringOrInt = string | number;

@Injectable()
export class SemesterService {
  constructor(private prisma: PrismaService) {}

  private generateKodeDanNama(tipe: string, tahunMulai: number, tahunSelesai: number) {
    const kode = Number(`${tahunMulai}${tahunSelesai}${tipe === 'GENAP' ? 1 : 0}`);
    const nama = `${tipe === 'GENAP' ? 'Genap' : 'Ganjil'} ${tahunMulai}/${tahunSelesai}`;
    return { kode, nama };
  }

  async create(createSemesterDto: CreateSemesterDto) {
    const { tipe, tahunMulai, tahunSelesai, status } = createSemesterDto;
    const { kode, nama } = this.generateKodeDanNama(tipe, tahunMulai, tahunSelesai);

    const existing = await this.prisma.semester.findFirst({
      where: {
        OR: [{ kode }, { nama }],
      },
    });

    if (existing) {
      throw new BadRequestException('Semester dengan kode atau nama yang sama sudah ada');
    }

    const created = await this.prisma.semester.create({
      data: {
        kode,
        nama,
        tipe,
        tahunMulai,
        tahunSelesai,
        status,
      },
    });

    return {
      success: true,
      message: 'Semester berhasil dibuat',
      data: created,
    };
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const searchConditions: Prisma.SemesterWhereInput[] = [];

    if (search) {
      searchConditions.push({
        nama: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      });

      if (search.toUpperCase() === 'GENAP' || search.toUpperCase() === 'GANJIL') {
        searchConditions.push({
          tipe: search.toUpperCase() as any,
        });
      }

      const year = parseInt(search);
      if (!isNaN(year)) {
        searchConditions.push({ tahunMulai: year });
        searchConditions.push({ tahunSelesai: year });
      }
    }

    const where: Prisma.SemesterWhereInput = searchConditions.length > 0
      ? { OR: searchConditions }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.semester.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { tahunMulai: 'desc' },
      }),
      this.prisma.semester.count({ where }),
    ]);

    return {
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.semester.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Semester tidak ditemukan');

    return {
      success: true,
      data,
    };
  }

  async findByOne(param: string, value: StringOrInt) {
    const data = await this.prisma.semester.findFirst({ where: { [param]: value } });

    return {
      success: true,
      data,
    };
  }

  async findByMany(param: string, value: StringOrInt) {
    const data = await this.prisma.semester.findMany({ where: { [param]: value } });

    return {
      success: true,
      data,
    };
  }

  async update(id: number, updateSemesterDto: UpdateSemesterDto) {
    const { tipe, tahunMulai, tahunSelesai, status } = updateSemesterDto;
    const { kode, nama } = this.generateKodeDanNama(tipe, tahunMulai, tahunSelesai);

    const existing = await this.prisma.semester.findFirst({
      where: {
        OR: [{ kode }, { nama }],
        NOT: { id },
      },
    });

    if (existing) {
      throw new BadRequestException('Semester dengan kode atau nama yang sama sudah ada');
    }

    const updated = await this.prisma.semester.update({
      where: { id },
      data: {
        kode,
        nama,
        tipe,
        tahunMulai,
        tahunSelesai,
        status,
      },
    });

    return {
      success: true,
      message: 'Semester berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: number) {
    const deleted = await this.prisma.semester.delete({ where: { id } });

    return {
      success: true,
      message: 'Semester berhasil dihapus',
      data: deleted,
    };
  }
}