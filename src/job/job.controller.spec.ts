// src/job/job.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';

// Fixture: a factory function to create a CreateJobDto with default values.
// You can override any property by passing an object with the desired values.
const createJobDtoFixture = (overrides: Partial<CreateJobDto> = {}): CreateJobDto => ({
  title: 'Software Developer',
  description: 'Develop cutting-edge web applications',
  location: 'Remote',
  salary: 100000,
  ...overrides,
});

describe('JobService', () => {
  let service: JobService;

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
    it('should create a new job with an id and createdAt timestamp', () => {
      // Arrange: use the fixture to generate a sample CreateJobDto
      const createJobDto = createJobDtoFixture();

      // Act: call the createJob method
      const result = service.createJob(createJobDto);

      // Assert: verify the result has expected properties
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createJobDto.title);
      expect(result.description).toBe(createJobDto.description);
      expect(result.location).toBe(createJobDto.location);
      expect(result.salary).toBe(createJobDto.salary);
      expect(result).toHaveProperty('createdAt');
      // Optionally check that createdAt is a valid date
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
    });
  });

  describe('updateJob', () => {
    it('should update an existing job', () => {
      // Arrange: use the fixture to generate a sample CreateJobDto
      const createJobDto = createJobDtoFixture();
      // Arrange: create a sample job using the fixture
      const job = service.createJob(createJobDto);
      // Arrange: use the fixture to generate a sample UpdateJobDto
      const updateJobDto = createJobDtoFixture();
      // Act: update the job
      const updatedJob = service.updateJob(job.id, updateJobDto);
      // Assert: verify the job was updated
      expect(updatedJob).not.toBeNull();
      expect(updatedJob!.title).toBe(updateJobDto.title);
      expect(updatedJob!.description).toBe(updateJobDto.description);
      expect(updatedJob!.location).toBe(updateJobDto.location);
      expect(updatedJob!.salary).toBe(updateJobDto.salary);
    })
    
  });

  describe('findAll', () => {
    it('should return all job postings (empty)', () => {
      // Act: call the findAll method
      const result = service.findAll();
      // Assert: verify that no jobs exist yet
      expect(result).toEqual([]);
    });

    it('should return all job postings (3)', () => {
      // Arrange: create 3 sample jobs using the fixture with optional overrides
      const job1 = service.createJob(createJobDtoFixture());
      const job2 = service.createJob(createJobDtoFixture({ title: 'Fullstack Developer' }));
      const job3 = service.createJob(createJobDtoFixture({ title: 'Frontend Developer' }));

      // Act: call the findAll method
      const result = service.findAll();

      // Assert: verify the result contains all created jobs
      expect(result).toEqual([job1, job2, job3]);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', () => {
      // Arrange: create a sample job using the fixture
      const job = service.createJob(createJobDtoFixture());

      // Act: call the findOne method with the job's id
      const result = service.findOne(job.id);

      // Assert: verify the result matches the expected job
      expect(result).toEqual(job);
    });

    it('should return null for non-existent id', () => {
      // Act: call the findOne method with a non-existent id
      const result = service.findOne('non-existent-id');

      // Assert: verify the result is null
      expect(result).toBeNull();
    });
  });
});
