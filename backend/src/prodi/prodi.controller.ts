import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProdiService } from './prodi.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateProdiDto, UpdateProdiDto } from './dto/prodi.dto';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prodi')
export class ProdiController {
    constructor(private readonly prodiService: ProdiService) {
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createProdiDto: CreateProdiDto) {
        return this.prodiService.create(createProdiDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.DOSEN, Role.VALIDATOR)
    findAll() {
        return this.prodiService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.DOSEN, Role.VALIDATOR)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.prodiService.findOne(id);
    }


    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProdiDto: UpdateProdiDto) {
        return this.prodiService.update(id, updateProdiDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.prodiService.remove(id);
    }
}
