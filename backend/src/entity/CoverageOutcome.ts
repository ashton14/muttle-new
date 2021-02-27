import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exercise} from './Exercise';
import {TestCase} from './TestCase';

@Entity('CoverageOutcome')
export class CoverageOutcome {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Exercise, exercise => exercise.coverageOutcomes)
  exercise!: Exercise;

  @OneToMany(() => TestCase, testCase => testCase.coverageOutcome)
  testCases!: TestCase[];

  @Column()
  lineNo!: number;

  @Column({default: false})
  lineCovered!: boolean;

  @Column({default: 0})
  branches!: number;

  @Column({default: 0})
  branchesCovered!: number;

  @Column({type: 'varchar', unique: true})
  sessionId!: string;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
