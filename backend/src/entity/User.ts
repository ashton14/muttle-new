import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {TestCase} from './TestCase';
import {Attempt} from './Attempt';
import { Exercise } from './Exercise';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({unique: true})
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

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
