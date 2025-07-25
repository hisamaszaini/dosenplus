import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Request,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { Response } from 'express';
import { PendidikanService } from './pendidikan.service';
import { CreatePendidikanDto, FindAllQueryDto } from './dto/create-pendidikan.dto';
import { UpdatePendidikanDto } from './dto/update-pendidikan.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('pendidikan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PendidikanController {
  constructor(private readonly pendidikanService: PendidikanService) { }


  @Post()
  @Roles(Role.DOSEN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreatePendidikanDto,
  ) {
    return this.pendidikanService.create({ ...body, file });
  }

  @Patch(':id')
  @Roles(Role.DOSEN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
        fileIsRequired: false,
      })
    )
    file: Express.Multer.File | undefined,
    @Request() req,
    @Body() body: UpdatePendidikanDto,
  ) {
    const dosenId = req.user.sub;
    return this.pendidikanService.update(id, { ...body, file, dosenId });
  }

  @Get()
  @Roles(Role.DOSEN, Role.ADMIN)
  findAll(
    @Query() query: FindAllQueryDto,
    @Request() req,
  ) {
    return this.pendidikanService.findAll(query, req.user.sub, req.user.role);
  }

  @Get('dosen/:dosenId')
  @Roles(Role.ADMIN, Role.VALIDATOR)
  async findByDosen(
    @Param('dosenId', ParseIntPipe) dosenId: number,
    @Query() query: FindAllQueryDto,
    @Request() req,
  ) {
    console.log(req.user.sub);
    return this.pendidikanService.findAll(
      query,
      dosenId,
      req.user.role,
    );
  }

  @Get(':id')
  @Roles(Role.DOSEN, Role.ADMIN, Role.VALIDATOR)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const item = await this.pendidikanService.findOne(id, req.user.sub, req.user.role,);

    // Check permission for non-admin users
    // if (req.user.role !== Role.ADMIN && item.dosenId !== req.user.sub) {
    //   throw new BadRequestException('Tidak diizinkan mengakses data ini');
    // }

    return item;
  }

  @Delete(':id')
  @Roles(Role.DOSEN, Role.ADMIN)
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.pendidikanService.remove(id, userId, role);
  }

  @Get(':id/file')
  @Roles(Role.DOSEN, Role.ADMIN)
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Query('download') download?: string,
  ) {
    const { sub: userId, role } = req.user;

    try {
      const { file, disposition } = await this.pendidikanService.streamFileById(
        id,
        userId,
        role,
        download === 'true',
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', disposition);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return file;
    } catch (error) {
      // Let the service handle the specific errors
      throw error;
    }
  }

  @Get(':id/preview')
  @Roles(Role.DOSEN, Role.ADMIN)
  async previewFile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sub: userId, role } = req.user;

    const { file, disposition } = await this.pendidikanService.streamFileById(
      id,
      userId,
      role,
      false, // Always inline for preview
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour for preview

    return file;
  }

  // Bulk operations for admin
  @Get('summary/stats')
  @Roles(Role.ADMIN)
  async getStats(@Request() req) {
    // This would require additional service method
    return {
      message: 'Stats endpoint - implement in service if needed',
    };
  }

  @Post('bulk/delete')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Request() req,
    @Body('ids') ids: number[],
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('IDs harus berupa array yang tidak kosong');
    }

    if (ids.some(id => !Number.isInteger(id) || id <= 0)) {
      throw new BadRequestException('Semua ID harus berupa angka positif');
    }

    // This would require additional service method for bulk operations
    return {
      message: 'Bulk delete endpoint - implement in service if needed',
      ids,
    };
  }

  // Export data (for admin)
  @Get('export/csv')
  @Roles(Role.ADMIN)
  async exportToCsv(
    @Request() req,
    @Res() res: Response,
    @Query('kategori') kategori?: string,
    @Query('jenjang') jenjang?: string,
    @Query('lulusTahun') lulusTahun?: string,
  ) {
    // This would require additional service method
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pendidikan-export.csv"');

    return res.send('Export CSV endpoint - implement in service if needed');
  }
}