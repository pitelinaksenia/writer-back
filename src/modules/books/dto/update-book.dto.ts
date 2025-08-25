import { IsNotEmpty, IsString } from 'class-validator';
import { FileEditAction } from '../../../common/enums/file-edit-action.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsString()
  description: string | null;

  @ApiProperty()
  @IsString()
  year: string | null;

  @ApiProperty()
  @IsString()
  coverKey: string;

  @ApiProperty()
  @IsString()
  sourceKey: string | null;

  coverActionStatus?: FileEditAction;

  sourceActionStatus?: FileEditAction;
}
