import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {TestCase} from './TestCase';

@Entity('Exercise')
export class Exercise {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column('longtext')
  description!: string;

  @Column('longtext')
  snippet!: string;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;

  @OneToMany(() => TestCase, testCase => testCase.exercise)
  testCases!: TestCase[];
}
