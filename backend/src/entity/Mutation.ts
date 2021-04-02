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
import {MutationOutcome} from './MutationOutcome';

@Entity('Mutation')
export class Mutation {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(
    () => MutationOutcome,
    mutationOutcome => mutationOutcome.mutations
  )
  mutationOutcome!: MutationOutcome;

  @Column()
  lineno!: number;

  @Column()
  operator!: string;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
