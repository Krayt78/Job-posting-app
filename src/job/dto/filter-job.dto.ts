// src/job/dto/filter-job.dto.ts
import { IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterJobDto {
  @IsOptional()
  @Transform(({ value }) => {
    // Split the comma-separated string into an array if needed.
    if (typeof value === 'string') {
      return value.split(',').map(skill => skill.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
