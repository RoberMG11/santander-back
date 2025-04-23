import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { BadRequestException } from '@nestjs/common';
import { CandidateRequestDto } from '../dto/CandidateRequestDto.dto';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { CandidateResponseDto } from '../dto/CandidateResponseDto.dto';

// Mock for functions fs.unlinkSync, XLSX.readFile y XLSX.utils.sheet_to_json
jest.mock('fs', () => ({
  unlinkSync: jest.fn(),
}));

jest.mock('xlsx', () => ({
  readFile: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe('CandidatesService', () => {
  let service: CandidatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatesService],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processFile', () => {
    it('should throw error if file is missing', () => {
      expect(() =>
        service.processFile({ name: 'Juan', surname: 'Carrera' }, null as any),
      ).toThrowError(new BadRequestException('Excel file is required'));
    });

    it('should throw error if candidate already exists', () => {
      service['candidates'] = [
        {
          id: 1,
          name: 'Juan',
          surname: 'Carrera',
          seniority: 'junior',
          yearsOfExperience: 3,
          availability: true,
        },
      ];

      const body: CandidateRequestDto = { name: 'Juan', surname: 'Carrera' };
      const file = { path: 'fake-path.xlsx' } as any;

      (XLSX.readFile as jest.Mock).mockReturnValue({ Sheets: { Sheet1: {} }, SheetNames: ['Sheet1'] });
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
        {
          Seniority: 'junior',
          'Years of experience': 3,
          Availability: true,
        },
      ]);

      expect(() => service.processFile(body, file)).toThrowError(
        new BadRequestException('Duplicate candidate: same name and surname already exist'),
      );
    });

    it('should add candidate when file is valid', () => {
      const body: CandidateRequestDto = { name: 'Jane', surname: 'Smith' };
      const file = { path: 'fake-path.xlsx' } as any;

      (XLSX.readFile as jest.Mock).mockReturnValue({ Sheets: { Sheet1: {} }, SheetNames: ['Sheet1'] });
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
        {
          Seniority: 'junior',
          'Years of experience': 2,
          Availability: true,
        },
      ]);

      const result = service.processFile(body, file);

      expect(result).toEqual({
        id: expect.any(Number),
        name: 'Jane',
        surname: 'Smith',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true,
      });

      expect(service.getAllCandidates()).toHaveLength(1);
      expect(fs.unlinkSync).toHaveBeenCalledWith('fake-path.xlsx');
    });
  });

  describe('getAllCandidates', () => {
    it('should return an array of candidates', () => {
      const candidate: CandidateResponseDto = {
        id: 1,
        name: 'Juan',
        surname: 'Carrera',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true,
      };
      service['candidates'] = [candidate];

      const candidates = service.getAllCandidates();
      expect(candidates).toEqual([candidate]);
    });
  });
});
