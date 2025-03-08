import { Module } from '@nestjs/common';
import { SkillService } from './skill/skill.service';

@Module({
  providers: [SkillService]
})
export class SkillModule {}
