// src/job/models/job.model.ts
export interface Job {
    id: string;          // a unique identifier, maybe a UUID
    title: string;
    description: string;
    location: string;
    createdAt: Date;
    salary: number;
  }
  