import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // مرحله ۱: بررسی نام کاربری و رمز
  async login(dto: LoginDto) {
    let user = await this.userRepo.findOne({ where: { username: dto.username } });

    if (!user) {
      user = this.userRepo.create({
        username: dto.username,
        password: dto.password,
      });
      await this.userRepo.save(user);
    } else {
      user.password = dto.password; // آپدیت رمز برای تست
      await this.userRepo.save(user);
    }

    // بررسی اینکه آیا کاربر قبلا شماره موبایل ثبت کرده یا نه
    return { 
      success: true, 
      hasPhone: !!user.phoneNumber 
    };
  }

  // مرحله ۲: ذخیره شماره و تولید کد
  async sendCode(username: string, phoneNumber: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneNumber = phoneNumber;
    user.verificationCode = code;
    await this.userRepo.save(user);

    // چاپ کد در ترمینال به جای ارسال پیامک
    console.log('=================================');
    console.log(`📱 کد ارسال شده به ${phoneNumber}: ${code}`);
    console.log('=================================');

    return { success: true, phone: phoneNumber };
  }

  // مرحله ۳: تأیید کد
  async verify(dto: { username: string; code: string }) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user || user.verificationCode !== dto.code) {
      throw new UnauthorizedException('کد تأیید نامعتبر است');
    }

    user.verificationCode = null;
    await this.userRepo.save(user);

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username },
    };
  }
}