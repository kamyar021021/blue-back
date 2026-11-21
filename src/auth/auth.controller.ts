import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-code')
  sendCode(@Body() body: { username: string; phoneNumber: string }) {
    return this.authService.sendCode(body.username, body.phoneNumber);
  }

  @Post('verify')
  verify(@Body() dto: VerifyDto) {
    return this.authService.verify(dto);
  }
}