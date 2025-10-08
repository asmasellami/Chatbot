import { Role } from './Role.model';

export class User {
  user_id!: number;
  username!: string;
  password!: string;
  roles!: Role[];
  email!: string;
  enabled!: boolean;
  createdAt!: Date;
}
