import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillType } from './skill-type.entity';
import { SkillService } from './skill.service';
import { IsValidSkillConstraint } from './validators/is-valid-skill.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([SkillType])],
  providers: [SkillService, IsValidSkillConstraint],
  exports: [SkillService],
})
export class SkillModule {}
