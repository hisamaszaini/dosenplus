import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { KategoriKegiatanKey, pelaksanaanSchemas } from './dto/create-pelaksanaan-pendidikan.dto';
import { Prisma, Role } from '@prisma/client';

const KategoriKegiatanEnum = z.enum([
  'PERKULIAHAN',
  'BIMBINGAN_SEMINAR',
  'BIMBINGAN_KKN',
  'BIMBINGAN_TUGAS_AKHIR',
  'PENGUJI_UJIAN_AKHIR',
  'PEMBINA_KEGIATAN_MHS',
  'PENGEMBANGAN_PROGRAM',
  'BAHAN_PENGAJARAN',
  'ORASI_ILMIAH',
  'JABATAN_STRUKTURAL',
  'BIMBING_DOSEN',
  'DATA_SERING',
  'PENGEMBANGAN_DIRI',
]);


type PelaksanaanPendidikanData = {
  jenisProduk: string;
  semesterId: number;
  judul: string;
  tglTerbit: string;
  penerbit: string;
  jumlahHalaman: number;
  bukti: File;
  isbn?: string;
  file: string;
};

@Injectable()
export class PelaksanaanPendidikanService {
  private readonly UPLOAD_PATH = path.resolve(process.cwd(), 'uploads/pendidikan');

  constructor(private readonly prisma: PrismaService) {
  }

  private getNilaiPakByKategori(kategori: string, data: any): number {
    switch (kategori) {
      case 'PERKULIAHAN': {
        const awal = Math.min(10, data.jumlahKelas)
        const lanjut = Math.max(0, data.jumlahKelas - 10)

        if (data.jabatanFungsional === 'Asisten Ahli') {
          return awal * 0.5 + lanjut * 0.25
        } else {
          return awal * 1 + lanjut * 0.5
        }
      }

      case 'BIMBINGAN_SEMINAR':
      case 'BIMBINGAN_KKN':
        return data.jumlahMahasiswa * 1

      case 'PENGUJI_UJIAN_AKHIR':
        return data.peran === 'Ketua Penguji' ? 1 * data.jumlahMahasiswa : 0.5 * data.jumlahMahasiswa

      case 'PEMBINA_KEGIATAN_MHS':
        return 2

      case 'PENGEMBANGAN_PROGRAM':
        return 2

      case 'BAHAN_PENGAJARAN':
        return data.jenisProduk === 'Buku Ajar' ? 20 : 5

      case 'ORASI_ILMIAH':
        return 5

      case 'JABATAN_STRUKTURAL': {
        const map = {
          'Rektor': 6,
          'Wakil Rektor': 5,
          'Ketua Sekolah': 4,
          'Pembantu Ketua Sekolah': 4,
          'Direktur Akademi': 4,
          'Pembantu Direktur': 3,
          'Sekretaris Jurusan': 3,
        }
        return map[data.namaJabatan] || 0
      }

      case 'BIMBING_DOSEN':
        return data.jenisBimbingan === 'Pencangkokan' ? 2 : 1

      case 'DATA_SERING':
        return data.jenis === 'Datasering' ? 5 : 4

      case 'PENGEMBANGAN_DIRI': {
        const jam = data.lamaJam
        if (jam > 960) return 15
        else if (jam >= 641) return 9
        else if (jam >= 481) return 6
        else if (jam >= 161) return 3
        else if (jam >= 81) return 2
        else if (jam >= 30) return 1
        else if (jam >= 10) return 0.5
        return 0
      }

      default:
        return 0
    }
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

  async create(
    kategori: KategoriKegiatanKey,
    dosenId: number,
    rawData: any,
    file: Express.Multer.File
  ) {
    const schema = pelaksanaanSchemas[kategori];
    if (!schema) throw new BadRequestException('Kategori tidak dikenali');

    // Ambil jabatan fungsional dari DB
    const dosen = await this.prisma.dosen.findUnique({
      where: { id: dosenId },
      select: { jabatan: true },
    });

    if (!dosen) throw new NotFoundException('Dosen tidak ditemukan');

    const parsed = schema.safeParse({
      ...rawData,
      jabatanFungsional: dosen.jabatan,
      file,
    });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    const data = parsed.data;
    const savedFileName = this.fileName(file.originalname);

    try {
      await this.write(file, savedFileName);
      const nilaiPak = this.getNilaiPakByKategori(kategori, data);

      return await this.prisma.$transaction(async (tx) => {
        return tx.pelaksanaanPendidikan.create({
          data: {
            dosenId,
            kategori,
            nilaiPak,
            ...data,
            file: savedFileName,
          },
        });
      });
    } catch (error) {
      console.error('Error saat menyimpan pelaksanaan pendidikan:', error);
      await this.deleteFile(savedFileName);
      throw new InternalServerErrorException('Gagal menyimpan pelaksanaan pendidikan');
    }
  }

  // async update(
  //   id: number,
  //   kategori: KategoriKegiatanKey,
  //   dosenId: number,
  //   rawData: any,
  //   file?: Express.Multer.File,
  //   role?: Role,
  // ) {
  //   const existing = await this.prisma.pelaksanaanPendidikan.findUnique({
  //     where: { id },
  //   });

  //   if (!existing) {
  //     throw new NotFoundException('Data tidak ditemukan');
  //   }

  //   if (role !== Role.ADMIN && existing.dosenId !== dosenId) {
  //     throw new ForbiddenException('Anda tidak diizinkan mengubah data ini');
  //   }

  //   const schema = pelaksanaanSchemas[kategori];
  //   if (!schema) throw new BadRequestException('Kategori tidak dikenali');

  //   const parsed = schema.safeParse({
  //     ...rawData,
  //     ...(file ? { file } : {}),
  //   });

  //   if (!parsed.success) {
  //     throw new BadRequestException(parsed.error.format());
  //   }

  //   const data = parsed.data;

  //   let savedFileName: string | undefined;
  //   let oldFileName: string | undefined;

  //   try {
  //     if (file) {
  //       savedFileName = this.fileName(file.originalname);
  //       await this.write(file, savedFileName);

  //       oldFileName = existing.file;
  //       data.file = savedFileName;
  //     }

  //     const nilaiPak = this.getNilaiPakByKategori(kategori, data);

  //     const updated = await this.prisma.$transaction(async (tx) => {
  //       return tx.pelaksanaanPendidikan.update({
  //         where: { id },
  //         data: {
  //           ...data,
  //           nilaiPak,
  //           totalPak: nilaiPak,
  //         },
  //       });
  //     });

  //     if (file && oldFileName) {
  //       await this.deleteFile(oldFileName);
  //     }

  //     return updated;
  //   } catch (error) {
  //     if (file && savedFileName) {
  //       await this.deleteFile(savedFileName);
  //     }

  //     throw new InternalServerErrorException('Gagal memperbarui pelaksanaan pendidikan');
  //   }
  // }

  async findAll(query: any, dosenId: number, role: Role) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const kategori = query.kategori as string | undefined;
    const semesterId = query.semesterId ? Number(query.semesterId) : undefined;

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

    const where: Prisma.PelaksanaanPendidikanWhereInput = {};

    if (role === Role.DOSEN) {
      where.dosenId = dosenId;
    }

    if (kategori) {
      const validationResult = KategoriKegiatanEnum.safeParse(kategori);
      if (validationResult.success) {
        where.kategori = validationResult.data;
      } else {
        throw new Error(`Invalid kategori value: ${kategori}`);
      }
    }

    if (semesterId) {
      where.semesterId = semesterId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pelaksanaanPendidikan.count({ where }),
      this.prisma.pelaksanaanPendidikan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,
        },
      }),
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

  async findOne(id: number, dosenId: number, role: Role) {
    const data = await this.prisma.pelaksanaanPendidikan.findUnique({
      where: { id },
      include: {
        dosen: { select: { id: true, nama: true } },
        semester: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Data tidak ditemukan');
    }

    if (role !== Role.ADMIN && data.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
    }

    return {
      success: true,
      data,
    };
  }

  async delete(id: number, dosenId: number, role: Role) {
    const existing = await this.prisma.pelaksanaanPendidikan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Data tidak ditemukan');
    }

    if (role !== Role.ADMIN && existing.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak diizinkan menghapus data ini');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.pelaksanaanPendidikan.delete({ where: { id } });
      });

      if (existing.file) {
        await this.deleteFile(existing.file);
      }
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghapus data');
    }
  }

}
