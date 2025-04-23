import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from '../service/candidates.service';
import { BadRequestException } from '@nestjs/common';
import { CandidateRequestDto } from '../dto/CandidateRequestDto.dto';
import { CandidateResponseDto } from '../dto/CandidateResponseDto.dto';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let service: CandidatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        {
          provide: CandidatesService,
          useValue: {
            processFile: jest.fn(),
            getAllCandidates: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CandidatesController>(CandidatesController);
    service = module.get<CandidatesService>(CandidatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadCandidate', () => {
    it('should call service.processFile with correct parameters', async () => {
      const body: CandidateRequestDto = { name: 'Jane', surname: 'Smith' };
      const file = { path: 'fake-path.xlsx' } as any;
      const result: CandidateResponseDto = {
        id: 1,
        name: 'Jane',
        surname: 'Smith',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true,
      };

      jest.spyOn(service, 'processFile').mockReturnValue(result);

      const response = await controller.uploadCandidate(body, file);
      expect(response).toEqual(result);
      expect(service.processFile).toHaveBeenCalledWith(body, file);
    });

    it('should handle errors from service', async () => {
      const body: CandidateRequestDto = { name: 'Jane', surname: 'Smith' };
      const file = { path: 'fake-path.xlsx' } as any;

      jest.spyOn(service, 'processFile').mockImplementation(() => {
        throw new BadRequestException('Duplicate candidate: same name and surname already exist');
      });

      await expect(controller.uploadCandidate(body, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllCandidates', () => {
    it('should return all candidates from service', async () => {
      const candidate: CandidateResponseDto = {
        id: 1,
        name: 'Juan',
        surname: 'Carrera',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true,
      };

      jest.spyOn(service, 'getAllCandidates').mockReturnValue([candidate]);

      const result = await controller.getAllCandidates();
      expect(result).toEqual([candidate]);
    });
  });
});
