import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';
import { UsersService } from './users.service';
import {
  ChangePasswordDto,
  CreateDosenUserDto,
  UpdateDosenProfileDto,
  UpdateUserStatusDto,
  FindAllUsersDto,
  findAllUsersSchema,
  CreateAdminUserDto,
  CreateValidatorUserDto,
  UpdateValidatorProfileDto,
  UpdateAdminProfileDto,
} from './dto/user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // =================================================================
  // == Manajemen Profil Pribadi (Untuk Pengguna yang Sedang Login) ==
  // =================================================================

  /**
   * Mendapatkan detail profil pengguna yang sedang login.
   */
  @Get('profile')
  getProfile(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.findById(userId);
  }

  /**
   * DOSEN memperbarui profilnya sendiri.
   */
  @Patch('profile/dosen')
  @Roles(TypeUserRole.DOSEN)
  updateMyDosenProfile(@Request() req, @Body() dto: UpdateDosenProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateDosenProfile(userId, dto);
  }

  /**
   * VALIDATOR memperbarui profilnya sendiri.
   */
  @Patch('profile/validator')
  @Roles(TypeUserRole.VALIDATOR)
  updateMyValidatorProfile(@Request() req, @Body() dto: UpdateValidatorProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateValidatorProfile(userId, dto);
  }

  /**
   * ADMIN memperbarui profilnya sendiri.
   */
  @Patch('profile/admin')
  @Roles(TypeUserRole.ADMIN)
  updateMyAdminProfile(@Request() req, @Body() dto: UpdateAdminProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateAdminProfile(userId, dto);
  }

  /**
   * Pengguna mengubah passwordnya sendiri.
   */
  @Patch('profile/password')
  changeMyPassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user.sub;
    return this.usersService.changePassword(userId, dto);
  }

  // =================================================================
  // ====== Manajemen Pengguna oleh Admin (Akses Terbatas) ======
  // =================================================================

  /**
   * [ADMIN] Membuat pengguna baru dengan role DOSEN.
   */
  @Post('dosen')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createDosenUser(@Body() dto: CreateDosenUserDto) {
    return this.usersService.createDosenWithUserAccount(dto);
  }

  /**
   * [ADMIN] Membuat pengguna admin baru
   */
  @Post('admin')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createAdminUser(@Body() dto: CreateAdminUserDto) {
    return this.usersService.createAdminUser(dto);
  }

  /**
   * [ADMIN] Membuat pengguna validator baru
   */
  @Post('validator')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createValidatorUser(@Body() dto: CreateValidatorUserDto) {
    return this.usersService.createValidatorUser(dto);
  }

  /**
   * [ADMIN] Mendapatkan semua pengguna dengan paginasi, filter, dan pencarian.
   * Contoh: /users?page=1&limit=10&search=john&role=DOSEN
   */
  @Get()
  @Roles(TypeUserRole.ADMIN)
  findAll(@Query(new ZodValidationPipe(findAllUsersSchema)) query: FindAllUsersDto) {
    return this.usersService.findAll(query);
  }

  /**
   * [ADMIN] Mencari pengguna berdasarkan nama, email, username, atau NIP.
   * Contoh: /users/search?q=ahmad
   */
  @Get('search')
  @Roles(TypeUserRole.ADMIN)
  searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  /**
   * [ADMIN] Mendapatkan detail lengkap pengguna berdasarkan ID.
   */
  @Get(':id')
  @Roles(TypeUserRole.ADMIN)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  /**
   * [ADMIN] Memperbarui profil DOSEN.
   */
  @Patch(':id/profile/dosen')
  @Roles(TypeUserRole.ADMIN)
  updateDosenProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDosenProfileDto,
  ) {
    return this.usersService.updateDosenProfile(id, dto, true);
  }

  /**
   * [ADMIN] Memperbarui profil Validator.
   */
  @Patch(':id/profile/validator')
  @Roles(TypeUserRole.ADMIN)
  updateValidatorProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValidatorProfileDto,
  ) {
    return this.usersService.updateValidatorProfile(id, dto, true);
  }

  /**
   * [ADMIN] Memperbarui profil Admin lain.
   */
  @Patch(':id/profile/admin')
  @Roles(TypeUserRole.ADMIN)
  updateAdminProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.usersService.updateAdminProfile(id, dto);
  }

  /**
   * [ADMIN] Memperbarui status pengguna (misal: ACTIVE, INACTIVE).
   */
  @Patch(':id/status')
  @Roles(TypeUserRole.ADMIN)
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(id, dto);
  }

  /**
   * [ADMIN] Menghapus pengguna secara permanen.
   */
  @Delete(':id')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  /**
   * [ADMIN] Menjalankan pengecekan integritas data.
   */
  @Get('maintenance/check-integrity')
  @Roles(TypeUserRole.ADMIN)
  checkDataIntegrity() {
    return this.usersService.fixMissingRelationalData();
  }
}