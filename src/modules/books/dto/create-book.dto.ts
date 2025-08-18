import { IsNotEmpty, IsString} from 'class-validator';

export class CreateBookDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    author: string;

    @IsString()
    description: string | null;

    @IsString()
    year: string | null;

}

