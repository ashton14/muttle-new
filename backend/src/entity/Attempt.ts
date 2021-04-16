import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exercise} from './Exercise';
import {User} from './User';
import {CoverageOutcome} from './CoverageOutcome';
import {MutationOutcome} from './MutationOutcome';
import {TestCase} from './TestCase';

@Entity('Attempt')
export class Attempt {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Exercise, exercise => exercise.attempts)
  exercise!: Exercise;

  @ManyToOne(() => User, user => user.attempts)
  user!: User;

  @ManyToMany(() => TestCase, {eager: true})
  @JoinTable()
  testCases!: TestCase[];

  @OneToMany(
    () => CoverageOutcome,
    coverageOutcome => coverageOutcome.attempt,
    {
      cascade: true,
      eager: true,
    }
  )
  coverageOutcomes!: CoverageOutcome[];

  @OneToMany(
    () => MutationOutcome,
    mutationOutcome => mutationOutcome.attempt,
    {
      cascade: true,
      eager: true,
    }
  )
  mutationOutcomes!: MutationOutcome[];

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
