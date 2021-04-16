import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Attempt} from './Attempt';

@Entity('CoverageOutcome')
export class CoverageOutcome {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Attempt, attempt => attempt.coverageOutcomes)
  attempt!: Attempt;

  @Column()
  lineNo!: number;

  @Column({default: false})
  lineCovered!: boolean;

  @Column({default: 0})
  conditions!: number;

  @Column({default: 0})
  conditionsCovered!: number;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
