import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

describe('JobService', () => {
  let service: JobService;

  const jobFixture: CreateJobDto = {
    title: 'Software Engineer',
    description: 'We are looking for a talented Software Engineer',
    location: 'New York, NY',
    salary: 100000,
  };

  const updatedJobFixture: UpdateJobDto = {
    title: 'Senior Engineer',
    description: 'Updated description',
    location: 'Remote',
    salary: 120000,
  };

  const createTestJob = (dto: CreateJobDto = jobFixture) => {
    return service.createJob(dto);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobService],
    }).compile();

    service = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a new job with provided data', () => {
      const createdJob = createTestJob();
      
      expect(createdJob).toEqual(expect.objectContaining({
        ...jobFixture,
        id: expect.any(String),
      }));
    });
  });

  describe('findOne', () => {
    it('should find a job by id', () => {
      const createdJob = createTestJob();
      const foundJob = service.findOne(createdJob.id);
      
      expect(foundJob).toEqual(createdJob);
    });

    it('should return null for non-existent job', () => {
      expect(service.findOne('non-existent-id')).toBeNull();
    });
  });

  describe('updateJob', () => {
    it('should update an existing job', () => {
      const createdJob = createTestJob();
      
      service.updateJob(createdJob.id, updatedJobFixture);
      const updatedJob = service.findOne(createdJob.id);
      
      expect(updatedJob).toEqual(expect.objectContaining({
        ...updatedJobFixture,
        id: createdJob.id,
      }));
    });
  });

  describe('deleteJob', () => {
    it('should delete an existing job', () => {
      const createdJob = createTestJob();
      
      service.deleteJob(createdJob.id);
      
      expect(service.findOne(createdJob.id)).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all jobs', () => {
      const job1 = createTestJob();
      const job2 = createTestJob({
        ...jobFixture,
        title: 'Product Manager',
      });

      const allJobs = service.findAll();
      
      expect(allJobs).toHaveLength(2);
      expect(allJobs).toEqual(expect.arrayContaining([job1, job2]));
    });

    it('should return empty array when no jobs exist', () => {
      expect(service.findAll()).toEqual([]);
    });
  });
});
