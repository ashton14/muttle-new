import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {CoverageOutcome} from './CoverageOutcome';
import {TestCase} from './TestCase';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({unique: true})
  sessionId!: string;

  @OneToMany(() => TestCase, testCase => testCase.user)
  testCases!: TestCase[];

  @OneToMany(() => CoverageOutcome, coverageOutcome => coverageOutcome.user)
  coverageOutcomes!: CoverageOutcome[];
}
