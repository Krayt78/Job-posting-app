// src/job/job.controller.ts
import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobService } from './job.service';
import { FilterJobDto } from './dto/filter-job.dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  createJob(@Body() createJobDto: CreateJobDto) {
    return this.jobService.createJob(createJobDto);
  }

  @Get()
  getJobs(@Query() filter: FilterJobDto) {
    // If skills are provided, filter by skills; otherwise, return all jobs.
    if (filter.skills && filter.skills.length > 0) {
      return this.jobService.getJobsBySkills(filter.skills);
    }
    return this.jobService.getJobs();
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }
}
