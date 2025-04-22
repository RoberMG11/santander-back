import { IsNotEmpty, IsString } from "class-validator";

export class CandidateRequestDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    surname: string;
}
