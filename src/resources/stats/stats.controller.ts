import { Controller, Get, SetMetadata } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Role } from '@/types/role';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get()
  findAll() {
    return this.statsService.findAll();
  }
}
