import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobModule } from './job/job.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [JobModule, SkillModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
