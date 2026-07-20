import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../database/entities/image.entity';
import { User } from '../database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { toUserDto, UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
  ) {}

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.requireById(userId);
    return toUserDto(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.requireById(userId);

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }
    if (dto.avatarId !== undefined) {
      const image = await this.imagesRepository.findOne({
        where: { id: dto.avatarId },
      });
      if (!image) {
        throw new NotFoundException('Avatar image not found');
      }
      user.avatarId = dto.avatarId;
    }

    const saved = await this.usersRepository.save(user);
    const reloaded = await this.requireById(saved.id);
    return toUserDto(reloaded);
  }

  async requireById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async ensureEmailAvailable(email: string): Promise<void> {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findByPhone(phone);
  }

  create(data: Partial<User>): User {
    return this.usersRepository.create(data);
  }

  save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  count(): Promise<number> {
    return this.usersRepository.count();
  }
}
