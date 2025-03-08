import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SkillType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
