import {
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Auth } from '../common/decorators/auth.decorators';
import { UserRole } from '../database/enums/user-role.enum';
import { ImageDto } from './dto/image.dto';
import { FilesService } from './files.service';

@ApiTags('images')
@Controller('images')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: ImageDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File): Promise<ImageDto> {
    return this.filesService.upload(file);
  }

  @Delete(':id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.filesService.remove(id);
  }
}
