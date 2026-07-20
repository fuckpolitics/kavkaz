import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../database/entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  create(data: Partial<RefreshToken>): RefreshToken {
    return this.repo.create(data);
  }

  save(token: RefreshToken): Promise<RefreshToken> {
    return this.repo.save(token);
  }

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: { tokenHash },
      relations: { user: { avatar: true } },
    });
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    await this.repo.delete({ tokenHash });
  }

  async deleteByUserAndHash(userId: string, tokenHash: string): Promise<void> {
    await this.repo.delete({ userId, tokenHash });
  }
}
