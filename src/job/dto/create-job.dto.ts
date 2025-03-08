import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsValidSkill } from '../../skill/validators/is-valid-skill.decorator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @IsNotEmpty()
  @IsString()
  @IsValidSkill({ message: 'Provided skills are not all valid' })
  skills: string[];
}