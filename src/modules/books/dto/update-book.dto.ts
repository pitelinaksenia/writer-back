import {IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {FileEditAction} from "../../../common/enums/file-edit-action.enum";

export class UpdateBookDto {

    @IsNotEmpty()
    @IsString()
    id: string;

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

    @IsString()
    cover: File | null;

    @IsString()
    source: File | null;

    @IsString()
    coverKey: string;

    @IsString()
    sourceKey: string | null;

    coverActionStatus?: FileEditAction;

    sourceActionStatus?: FileEditAction;
}

