// src/skill/skill.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SkillService } from './skill.service';
import { SkillType } from './skill-type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SkillService', () => {
  let service: SkillService;
  const mockRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: getRepositoryToken(SkillType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllowedSkillNames', () => {
    it('should return an array of skill names', async () => {
      // Arrange: define the repository response
      const skillObjects = [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'TypeScript' },
      ];
      mockRepository.find.mockResolvedValue(skillObjects);

      // Act: call the service method
      const names = await service.getAllowedSkillNames();

      // Assert: verify that the names are correctly returned
      expect(names).toEqual(['JavaScript', 'TypeScript']);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array when no skills are found', async () => {
      // Arrange: repository returns an empty array
      mockRepository.find.mockResolvedValue([]);

      // Act: call the service method
      const names = await service.getAllowedSkillNames();

      // Assert: expect an empty array
      expect(names).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should propagate errors from the repository', async () => {
      // Arrange: repository rejects the promise
      mockRepository.find.mockRejectedValue(new Error('Repository error'));

      // Act & Assert: expect the service method to throw the error
      await expect(service.getAllowedSkillNames()).rejects.toThrow('Repository error');
    });
  });
});
