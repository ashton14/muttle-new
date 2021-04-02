import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exercise} from './Exercise';
import {User} from './User';
import {Mutation} from './Mutation';
import {MutationStatus} from '../server/routes/run/mutation';

@Entity('MutationOutcome')
export class MutationOutcome {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Exercise, exercise => exercise.mutationOutcomes)
  exercise!: Exercise;

  @ManyToOne(() => User, user => user.mutationOutcomes)
  user!: User;

  @OneToMany(() => Mutation, mutation => mutation.mutationOutcome, {
    cascade: true,
  })
  mutations!: Mutation[];

  @Column({type: 'longtext', nullable: true})
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
