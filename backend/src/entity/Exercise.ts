import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {TestCase} from './TestCase';
import {Attempt} from './Attempt';

@Entity('Exercise')
export class Exercise {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('text')
  snippet!: string;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;

  @OneToMany(() => TestCase, testCase => testCase.exercise)
  testCases!: TestCase[];

  @OneToMany(() => Attempt, attempts => attempts.exercise)
  attempts!: Attempt[];
}
