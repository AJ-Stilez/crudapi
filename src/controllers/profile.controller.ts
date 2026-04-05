import { Controller, Get, UseGuards, Req, Post, Query } from '@nestjs/common';
import { AdminOnly } from 'src/decorators/admin_only.decorator';
import { User } from 'src/decorators/params/user.decorator';
import { AdminOnlyGuard } from 'src/guards/admin-only.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
    
  @UseGuards(JwtAuthGuard)
  // @AdminOnly()
  @Get()
  getProfile(@Query("email") email: string) {
    return email; // payload from validate() in JwtStrategy
  }

  @AdminOnly()
  @Post('say-hello')
  sayHello() {
    return "Hello"; // payload from validate() in JwtStrategy
  }
}
