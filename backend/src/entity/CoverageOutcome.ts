import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exercise} from './Exercise';
import {User} from './User';

@Entity('CoverageOutcome')
export class CoverageOutcome {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Exercise, exercise => exercise.coverageOutcomes)
  exercise!: Exercise;

  @ManyToOne(() => User, user => user.coverageOutcomes)
  user!: User;

  @Column()
  lineNo!: number;

  @Column({default: false})
  lineCovered!: boolean;

  @Column({default: 0})
  branches!: number;

  @Column({default: 0})
  branchesCovered!: number;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
