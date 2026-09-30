import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserStats } from './entities/user-stats.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStats)
    private readonly userStatsRepository: Repository<UserStats>,
  ) {}

  /**
   * Sinh mã học sinh ngẫu nhiên 6 ký tự gồm chữ cái in hoa và chữ số (A-Z, 0-9)
   * Đảm bảo tính duy nhất tuyệt đối trong toàn bộ hệ thống
   */
  async generateUniqueStudentCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Bỏ các ký tự dễ nhầm lẫn như O, 0, I, 1
    let isUnique = false;
    let code = '';

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
      }

      const existingUser = await this.userRepository.findOne({
        where: { studentCode: code },
      });

      if (!existingUser) {
        isUnique = true;
      }
    }

    return code;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['stats'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Tìm người dùng theo tên người dùng HOẶC địa chỉ email (kèm password để xác thực)
   */
  async findByIdentifierWithPassword(identifier: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.stats', 'stats')
      .where('user.username = :identifier OR user.email = :identifier', {
        identifier,
      })
      .getOne();
  }

  async findByIdWithRefreshToken(id: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  async create(userData: Partial<User>): Promise<User> {
    const existingUsername = await this.findByUsername(userData.username);
    if (existingUsername) {
      throw new ConflictException('Tên người dùng này đã được sử dụng');
    }

    const existingEmail = await this.findByEmail(userData.email);
    if (existingEmail) {
      throw new ConflictException('Địa chỉ email này đã được đăng ký');
    }

    let studentCode: string | null = null;
    if (userData.role === UserRole.HOC_SINH) {
      studentCode = await this.generateUniqueStudentCode();
    }

    const newUser = this.userRepository.create({
      ...userData,
      studentCode,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Nếu là học sinh, tự động khởi tạo bản ghi user_stats ban đầu
    if (savedUser.role === UserRole.HOC_SINH) {
      const initialStats = this.userStatsRepository.create({
        userId: savedUser.id,
        streakDays: 0,
        lightningPoints: 0,
        rankTier: 'Đồng',
      });
      await this.userStatsRepository.save(initialStats);
      savedUser.stats = initialStats;
    }

    return savedUser;
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }
}
