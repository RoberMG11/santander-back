import { Controller, Post, UploadedFile, UseInterceptors, Body, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CandidatesService } from '../service/candidates.service';
import { CandidateRequestDto } from '../dto/CandidateRequestDto.dto';
import { extname } from 'path';
import { CandidateResponseDto } from '../dto/CandidateResponseDto.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return callback(new Error("Only Excel files are allowed!"), false);
        }
        callback(null, true)
      },
    }),
  )
  async uploadCandidate(
    @Body() body: CandidateRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidatesService.processFile(body, file);
  }

  @Get()
  getAllCandidates(): CandidateResponseDto[] {
    return this.candidatesService.getAllCandidates();
  }
}
