import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TestCase } from './TestCase';
import { Attempt } from './Attempt';
import { Exercise } from './Exercise';
import { ExerciseOffering } from './ExerciseOffering';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @OneToMany(() => TestCase, testCase => testCase.user)
  testCases!: TestCase[];

  @OneToMany(() => Attempt, attempts => attempts.exercise)
  attempts!: Attempt[];

  @OneToMany(() => Exercise, exercises => exercises.owner)
  exercises!: Exercise[];

  @OneToMany(() => ExerciseOffering, exerciseOffering => exerciseOffering.owner)
  exerciseOfferings!: ExerciseOffering[];

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  modified!: Date;
}
