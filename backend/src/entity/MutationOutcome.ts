import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Mutation} from './Mutation';
import {Attempt} from './Attempt';

export enum MutationStatus {
  SURVIVED = 'survived',
  TIMEOUT = 'timeout',
  INCOMPETENT = 'incompetent',
  KILLED = 'killed',
}

@Entity('MutationOutcome')
export class MutationOutcome {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Attempt, attempt => attempt.mutationOutcomes)
  attempt!: Attempt;

  @OneToMany(() => Mutation, mutation => mutation.mutationOutcome, {
    cascade: true,
    eager: true,
  })
  mutations!: Mutation[];

  @Column('text', {nullable: true})
  exception_traceback?: string;

  @Column({nullable: true})
  killer?: string;

  @Column({nullable: true})
  module?: string;

  @Column()
  number!: number;

  @Column()
  status!: MutationStatus;

  @Column()
  tests_run!: number;

  @Column()
  time!: number;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
