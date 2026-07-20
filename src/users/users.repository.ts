import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(data: Partial<User>): User {
    return this.repo.create(data);
  }

  save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: { avatar: true },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      relations: { avatar: true },
    });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({
      where: { phone },
      relations: { avatar: true },
    });
  }

  findAll(): Promise<User[]> {
    return this.repo.find({
      relations: { avatar: true },
      order: { createdAt: 'DESC' },
    });
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
