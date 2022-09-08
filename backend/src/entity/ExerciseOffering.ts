import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attempt } from './Attempt';
import { Exercise } from './Exercise';
import { User } from './User';

@Entity()
export class ExerciseOffering {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'text', unique: true })
  inviteCode!: string;

  @ManyToOne(() => Exercise, exercise => exercise.exerciseOfferings)
  exercise!: Exercise;

  @ManyToOne(() => User, user => user.exerciseOfferings)
  owner!: User;

  @OneToMany(() => Attempt, attempt => attempt.exerciseOffering)
  attempts!: Attempt[];

  @Column({ type: 'boolean', default: true })
  conditionCoverage!: boolean;

  @Column({ type: 'text', array: true, default: () => 'array[]::text[]' })
  mutators!: string[];

  @Column({ type: 'integer', nullable: true })
  minTests?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  modified!: Date;
}
