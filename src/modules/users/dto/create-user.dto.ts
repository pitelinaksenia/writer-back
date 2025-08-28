import { Column } from 'typeorm';

export class CreateUserDTO {
  @Column()
  login: string;

  @Column()
  passHash: string;
}
