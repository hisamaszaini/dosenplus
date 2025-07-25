import { Injectable, NotFoundException, ForbiddenException, StreamableFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreatePendidikanDto, createPendidikanSchema, FindAllQueryDto } from './dto/create-pendidikan.dto';
import { UpdatePendidikanDto, updatePendidikanSchema } from './dto/update-pendidikan.dto';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  kategori?: string;
  jenjang?: string;
  lulusTahun?: number;
  userId: number;
  role: Role;
}

interface CreatePendidikanServiceDto extends CreatePendidikanDto {
  dosenId: number;
  file: Express.Multer.File;
}

interface UpdatePendidikanServiceDto extends UpdatePendidikanDto {
  dosenId: number;
  file?: Express.Multer.File;
}

// tambahkan di pendidikan.service.ts
interface PendidikanFormalData
  extends Omit<CreatePendidikanServiceDto, 'file' | 'kategori' | 'jenisDiklat' | 'namaDiklat' | 'penyelenggara' | 'peran' | 'tingkatan' | 'jumlahJam' | 'tglSertifikat' | 'tempat' | 'tanggalMulai' | 'tanggalSelesai'> { }
interface DiklatData
  extends Omit<CreatePendidikanServiceDto, 'file' | 'kategori' | 'jenjang' | 'prodi' | 'fakultas' | 'perguruanTinggi' | 'lulusTahun'> { }

@Injectable()
export class PendidikanService {
  private readonly UPLOAD_PATH = path.resolve(process.cwd(), 'uploads/pendidikan');

  constructor(private readonly prisma: PrismaService) {
  }

  private ensureDir() {
    if (!fs.existsSync(this.UPLOAD_PATH)) fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
  }

  private fileName(original: string) {
    return `${uuidv4()}${path.extname(original)}`;
  }

  private async write(file: Express.Multer.File, name: string) {
    try {
      await fs.promises.writeFile(path.join(this.UPLOAD_PATH, name), file.buffer);
    } catch {
      throw new InternalServerErrorException('Gagal menyimpan file');
    }
  }

  private getNilaiPak(kategori: string, jenjang?: string): number {
    if (kategori === 'Diklat') return 3;

    const n = jenjang?.toLowerCase().trim() ?? '';
    if (n === 's2' || n.includes('magister')) return 150;
    if (n === 's3' || n.includes('doktor')) return 200;
    return 0;
  }

  private validatePendidikanFormal(dto: PendidikanFormalData): void {
    const required = ['jenjang', 'prodi', 'fakultas', 'perguruanTinggi', 'lulusTahun'];
    const missing = required.filter(f => !dto[f]);
    if (missing.length) throw new BadRequestException(`Data pendidikan formal tidak lengkap: ${missing.join(', ')}`);
  }

  private validateDiklat(dto: DiklatData): void {
    const required = [
      'jenisDiklat', 'namaDiklat', 'penyelenggara', 'peran',
      'tingkatan', 'jumlahJam', 'tglSertifikat', 'tanggalMulai', 'tanggalSelesai',
    ];
    const missing = required.filter(f => !dto[f]);
    if (missing.length) throw new BadRequestException(`Data diklat tidak lengkap: ${missing.join(', ')}`);
  }

  private async deleteFile(fileName: string): Promise<void> {
    if (!fileName) return;

    const filePath = path.join(this.UPLOAD_PATH, fileName);

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  async create(dto: CreatePendidikanServiceDto) {
    // validasi payload (non-file) -> otomatis jadi Date
    const data = createPendidikanSchema.parse(dto);

    // validasi kategori
    if (data.kategori === 'Pendidikan Formal')
      this.validatePendidikanFormal(data);
    if (data.kategori === 'Diklat')
      this.validateDiklat(data);

    const name = this.fileName(dto.file.originalname);

    return this.prisma.$transaction(async tx => {
      // 1) simpan file dulu
      await this.write(dto.file, name);

      // 2) insert ke DB
      const record = await tx.pendidikan.create({
        data: {
          dosen: { connect: { id: data.dosenId } },
          kategori: data.kategori,
          kegiatan: data.kegiatan,
          nilaiPak: this.getNilaiPak(data.kategori, data.jenjang),
          file: name,
          ...(data.kategori === 'Pendidikan Formal'
            ? {
              jenjang: data.jenjang,
              prodi: data.prodi,
              fakultas: data.fakultas,
              perguruanTinggi: data.perguruanTinggi,
              lulusTahun: data.lulusTahun,
            }
            : {
              jenisDiklat: data.jenisDiklat,
              namaDiklat: data.namaDiklat,
              penyelenggara: data.penyelenggara,
              peran: data.peran,
              tingkatan: data.tingkatan,
              jumlahJam: data.jumlahJam,
              noSertifikat: data.noSertifikat,
              tglSertifikat: data.tglSertifikat,
              tempat: data.tempat,
              tanggalMulai: data.tanggalMulai,
              tanggalSelesai: data.tanggalSelesai,
            }),
        },
        include: { dosen: { select: { id: true, nama: true } } },
      });

      return { success: true, message: 'Data pendidikan berhasil disimpan', data: record };
    });
  }

  // service
  async update(id: number, dto: UpdatePendidikanServiceDto) {
    const data = updatePendidikanSchema.parse(dto);
    const record = await this.prisma.pendidikan.findUnique({ where: { id } });
    if (!record) throw new NotFoundException();

    let newFileName: string | undefined;

    return this.prisma.$transaction(async tx => {
      // 1. jika ada file baru → hapus lama, simpan baru
      if (dto.file) {
        newFileName = this.fileName(dto.file.originalname);
        await this.write(dto.file, newFileName);
        if (record.file) await this.deleteFile(record.file);
      }

      const jenjang = data.jenjang ?? record.jenjang ?? undefined;

      // 2. update DB
      const updated = await tx.pendidikan.update({
        where: { id },
        data: {
          ...data,
          ...(newFileName && { file: newFileName }),
          nilaiPak: this.getNilaiPak(data.kategori ?? record.kategori, jenjang),
        },
        include: { dosen: { select: { id: true, nama: true } } },
      });

      return { success: true, message: 'Data berhasil diperbarui', data: updated };
    });
  }


  async findAll(query: FindAllQueryDto, userId: number, role: Role) {
    const { search, sortBy, sortOrder, ...filters } = query;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only allow specific filter keys
    const allowedFilterKeys = ['kategori', 'jenjang', 'lulusTahun', 'tingkatan'];
    const safeFilters = Object.entries(filters).filter(
      ([key, value]) =>
        allowedFilterKeys.includes(key) &&
        value !== undefined &&
        (typeof value !== 'string' || value.trim() !== '')
    );

    const where: Prisma.PendidikanWhereInput = {
      ...(role === Role.DOSEN && { dosenId: userId }),
      ...Object.fromEntries(safeFilters),
      ...(search && {
        OR: [
          { kegiatan: { contains: search, mode: 'insensitive' } },
          { prodi: { contains: search, mode: 'insensitive' } },
          { namaDiklat: { contains: search, mode: 'insensitive' } },
          { penyelenggara: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // ✨ Sorting dengan default & validasi
    const allowedSortFields = [
      'id', 'kategori', 'jenjang', 'prodi', 'lulusTahun',
      'nilaiPak', 'createdAt', 'updatedAt',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [rows, total] = await Promise.all([
      this.prisma.pendidikan.findMany({
        where,
        orderBy: { [safeSortBy]: safeSortOrder },
        skip,
        take: limit,
        include: {
          dosen: { select: { id: true, nama: true } },
        },
      }),
      this.prisma.pendidikan.count({ where }),
    ]);

    return {
      success: true,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: rows,
    };
  }

  async findOne(id: number, userId: number, role: Role) {
    const whereCondition: any = { id };

    if (role === Role.DOSEN) {
      whereCondition.dosenId = userId;
    }

    const item = await this.prisma.pendidikan.findFirst({
      where: whereCondition,
      include: {
        dosen: {
          select: {
            id: true,
            nama: true,
          }
        }
      }
    });

    if (!item) throw new NotFoundException('Pendidikan not found');
    return item;
  }

  async remove(id: number, userId: number, role: Role) {
    const existing = await this.prisma.pendidikan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data tidak ditemukan');
    if (role !== Role.ADMIN && existing.dosenId !== userId) {
      throw new ForbiddenException('Tidak diizinkan menghapus data ini');
    }

    try {
      await this.prisma.pendidikan.delete({ where: { id } });

      // Delete file after successful database deletion
      if (existing.file) {
        await this.deleteFile(existing.file);
      }

      return {
        success: true,
        message: 'Data pendidikan berhasil dihapus'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Data tidak ditemukan');
      }

      console.error('Database error:', error);
      throw new InternalServerErrorException('Gagal menghapus data pendidikan');
    }
  }

  async streamFileById(
    id: number,
    userId: number,
    role: Role,
    asDownload = false,
  ): Promise<{ file: StreamableFile; filename: string; disposition: string }> {
    const data = await this.prisma.pendidikan.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Data tidak ditemukan');

    if (role !== Role.ADMIN && data.dosenId !== userId) {
      throw new ForbiddenException('Anda tidak berhak mengakses file ini');
    }

    const filePath = path.join(this.UPLOAD_PATH, data.file);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan di sistem');
    }

    const stream = fs.createReadStream(filePath);
    const filename = path.basename(filePath);
    const disposition = asDownload
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`;

    return {
      file: new StreamableFile(stream),
      filename,
      disposition,
    };
  }
}