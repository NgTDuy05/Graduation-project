import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tạo Access Token và Refresh Token cho người dùng
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      studentCode: user.studentCode || undefined,
      fullName: user.fullName,
    };

    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'unilearn_access_token_secret_key_2026_super_secure';
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION') || '1d';

    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'unilearn_refresh_token_secret_key_2026_super_secure';
    const jwtRefreshExpiration =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiration,
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: jwtRefreshSecret,
          expiresIn: jwtRefreshExpiration,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Đăng ký tài khoản mới
   */
  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp với mật khẩu');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      role: registerDto.role,
    });

    const tokens = await this.generateTokens(user);

    // Lưu hash của refresh token vào CSDL để bảo mật
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    const { password, ...safeUser } = user;

    return {
      message: 'Đăng ký tài khoản thành công',
      user: safeUser,
      ...tokens,
    };
  }

  /**
   * Đăng nhập thông minh (tự nhận diện username hoặc email)
   */
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifierWithPassword(
      loginDto.identifier.trim(),
    );

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập / Email hoặc mật khẩu không chính xác',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Tên đăng nhập / Email hoặc mật khẩu không chính xác',
      );
    }

    const tokens = await this.generateTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    const { password, ...safeUser } = user;

    return {
      message: 'Đăng nhập thành công',
      user: safeUser,
      ...tokens,
    };
  }

  /**
   * Làm mới Access Token bằng Refresh Token
   */
  async refreshToken(dto: RefreshTokenDto) {
    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'unilearn_refresh_token_secret_key_2026_super_secure';

    let payload: { sub: number };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const userWithToken = await this.usersService.findByIdWithRefreshToken(
      payload.sub,
    );

    if (!userWithToken || !userWithToken.refreshToken) {
      throw new UnauthorizedException('Phiên đăng nhập đã bị hủy');
    }

    const isMatch = await bcrypt.compare(
      dto.refreshToken,
      userWithToken.refreshToken,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không còn tồn tại');
    }

    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      message: 'Làm mới token thành công',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Đăng xuất người dùng (thu hồi refresh token)
   */
  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Đăng xuất thành công' };
  }
}
