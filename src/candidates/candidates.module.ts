import { Module } from '@nestjs/common';
import { CandidatesController } from './controller/candidates.controller';
import { CandidatesService } from './service/candidates.service';

@Module({
  controllers: [CandidatesController],
  providers: [CandidatesService]
})
export class CandidatesModule { }
