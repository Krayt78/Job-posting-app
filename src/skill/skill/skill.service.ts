import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillType } from './skill-type.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(SkillType)
    private readonly skillTypeRepository: Repository<SkillType>,
  ) {}

  async getAllowedSkillNames(): Promise<string[]> {
    const skills = await this.skillTypeRepository.find();
    return skills.map(skill => skill.name);
  }
}
