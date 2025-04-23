import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { CandidateRequestDto } from '../dto/CandidateRequestDto.dto';
import { CandidateResponseDto } from '../dto/CandidateResponseDto.dto';

@Injectable()
export class CandidatesService {
    private static idCounter = 1;
    private candidates: CandidateResponseDto[] = [];

    /**
     * Process the file and saves the candidate
     * @param CandidateRequestDto body
     * @param Express.Multer.File file
     * @returns CandidateResponseDto
     */
    processFile(body: CandidateRequestDto, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("Excel file is required")
        }

        try {
            const workbook = XLSX.readFile(file.path);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelData = XLSX.utils.sheet_to_json(worksheet);

            // Validate Excel data
            console.log(excelData)
            if (excelData.length !== 1) {
                throw new BadRequestException("Excel file must contain exactly one row of data")
            }

            const excelRow = excelData[0] as any

            // Validate required fields
            if (
                !excelRow.hasOwnProperty("Seniority") ||
                !excelRow.hasOwnProperty("Years of experience") ||
                !excelRow.hasOwnProperty("Availability")
            ) {
                throw new BadRequestException(
                    "Excel file must contain Seniority, Years of experience, and Availability columns",
                )
            }

            // Validate seniority
            if (excelRow["Seniority"] !== "junior" && excelRow["Seniority"] !== "senior") {
                throw new BadRequestException('Seniority must be either "junior" or "senior"')
            }

            // Validate years of experience
            if (typeof excelRow["Years of experience"] !== "number" || excelRow["Years of experience"] < 0) {
                throw new BadRequestException("Years of experience must be a positive number")
            }

            // Validate availability
            if (typeof excelRow["Availability"] !== "boolean") {
                throw new BadRequestException("Availability must be a boolean value")
            }

            // Combine data
            const candidate: CandidateResponseDto = {
                id: CandidatesService.idCounter++,
                name: body.name,
                surname: body.surname,
                seniority: excelRow["Seniority"],
                yearsOfExperience: excelRow["Years of experience"],
                availability: excelRow["Availability"],
            }

            // Verify no duplicate (case-insensitive)
            const alreadyExists = this.candidates.some(existing =>
                existing.name.toLowerCase() === body.name.toLowerCase() &&
                existing.surname.toLowerCase() === body.surname.toLowerCase()
            );

            if (alreadyExists) {
                throw new BadRequestException("Duplicate candidate: same name and surname already exist");
            }

            // We save the candidate
            this.candidates.push(candidate);

            // Delete the file after processing
            fs.unlinkSync(file.path);

            return candidate
        } catch (error) {
            // Delete the file after processing
            fs.unlinkSync(file.path);

            if (error instanceof BadRequestException) {
                throw error
            }
            throw new BadRequestException(`Error processing Excel file: ${error.message}`)
        }
    }

    /**
     * Returns the list of candidates
     * @returns CandidateResponseDto[]
     */
    getAllCandidates(): CandidateResponseDto[] {
        return this.candidates;
    }
}
