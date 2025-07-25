import { Body, Controller, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateDosenUserDto, LoginDto } from 'src/users/dto/user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from '@prisma/client/runtime/library';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() dto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('register/dosen')
  @HttpCode(HttpStatus.CREATED)
  registerDosen(@Body() dto: CreateDosenUserDto) {
    return this.authService.registerDosen(dto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @Post('register/internal')
  // @HttpCode(HttpStatus.CREATED)
  // registerInternalUser(@Body() dto: CreateInternalUserDto) {
  //   return this.authService.registerInternalUser(dto);
  // }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Query('token') token: string,
    @Body('password') pass: string,
  ) {
    return this.authService.resetPassword(token, pass);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refreshTokens(@Request() req) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const userId = req.user.sub;
    await this.authService.logout(userId);

    return {
      message: 'Logout berhasil',
      statusCode: HttpStatus.OK
    };
  }
}