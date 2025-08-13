import { IsNotEmpty, IsString} from 'class-validator';
import {FileEditAction} from "../../../common/enums/file-edit-action.enum";

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

    @IsString()
    cover: File | null;

    @IsString()
    source: File | null;
}

// export interface GetBookDto {
//     id: string;
// }
//
// export interface BookDataWithActionStatus extends CreateBookDto {
//     id: string;
//     coverPath?: string;
//     sourcePath?: string;
//     coverActionStatus?: FileEditAction;
//     sourceActionStatus?: FileEditAction;
// }