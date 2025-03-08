// src/job/job.service.ts
import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './model/job.model';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have installed uuid

@Injectable()
export class JobService {
  private jobs: Job[] = [];

  // Method to create a new job posting
  createJob(createJobDto: CreateJobDto): Job {
    const newJob: Job = {
      id: uuidv4(), // Generate a unique ID
      title: createJobDto.title,
      description: createJobDto.description,
      location: createJobDto.location,
      createdAt: new Date(),
      salary: createJobDto.salary,
      skills: createJobDto.skills,
    };

    // Store the new job in the in-memory array
    this.jobs.push(newJob);
    return newJob;
  }

  //Method to get all job postings
  getJobs(): Job[] {
    return this.jobs;
  }

  //Method to get a specific job by ID
  getJob(id: string): Job | null {
    return this.jobs.find(job => job.id === id) || null;
  }

  //Method to get jobs that have all the skills listed in the skills array
  getJobsBySkills(skills: string[]): Job[] {
    return this.jobs.filter(job => job.skills.every(skill => skills.includes(skill)));
  }

  //Method to update a job by ID
  updateJob(id: string, updateJobDto: UpdateJobDto): Job | null {
    const job = this.getJob(id);
    if (!job) {
      return null;
    }
    if (updateJobDto.title !== undefined) {
      job.title = updateJobDto.title;
    }
    if (updateJobDto.description !== undefined) {
      job.description = updateJobDto.description;
    }
    if (updateJobDto.location !== undefined) {
      job.location = updateJobDto.location;
    }
    if (updateJobDto.salary !== undefined) {
      job.salary = updateJobDto.salary;
    }
    if (updateJobDto.skills !== undefined) {
      job.skills = updateJobDto.skills;
    }
    return job;
  }

  //Method to delete a job by ID
  deleteJob(id: string): boolean {
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      return false;
    }
    this.jobs.splice(jobIndex, 1);
    return true;
  }
}
