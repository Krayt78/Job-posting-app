// src/job/dto/update-job.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUsersDto extends PartialType(CreateUserDto) {}