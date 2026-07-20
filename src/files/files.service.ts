import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { isAbsolute, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Image } from '../database/entities/image.entity';
import { ImageDto, toImageDto } from './dto/image.dto';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
    configService: ConfigService,
  ) {
    this.uploadDir = (() => {
      const dir = configService.get<string>('UPLOAD_DIR', './uploads');
      return isAbsolute(dir) ? dir : resolve(process.cwd(), dir);
    })();
    this.publicBaseUrl = configService.get<string>(
      'PUBLIC_BASE_URL',
      'http://localhost:3000',
    );
  }

  async upload(file: Express.Multer.File): Promise<ImageDto> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    const filename = `${randomUUID()}${ext}`;
    const filepath = join(this.uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);

    const url = `${this.publicBaseUrl.replace(/\/$/, '')}/uploads/${filename}`;
    const image = this.imagesRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: null,
      height: null,
      url,
    });
    const saved = await this.imagesRepository.save(image);
    return toImageDto(saved)!;
  }

  async remove(id: string): Promise<void> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    const filepath = join(this.uploadDir, image.filename);
    try {
      await fs.unlink(filepath);
    } catch {
      // file may already be missing
    }
    await this.imagesRepository.remove(image);
  }

  async requireById(id: string): Promise<Image> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  async findByIds(ids: string[]): Promise<Image[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.imagesRepository
      .createQueryBuilder('image')
      .whereInIds(ids)
      .getMany();
  }
}
