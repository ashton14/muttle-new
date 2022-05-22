import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {MutationOutcome} from './MutationOutcome';
import {MutatedLine} from './MutatedLine';

@Entity('Mutation')
export class Mutation {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(
    () => MutationOutcome,
    mutationOutcome => mutationOutcome.mutations
  )
  mutationOutcome!: MutationOutcome;

  @OneToMany(() => MutatedLine, mutatedLine => mutatedLine.mutation, {
    cascade: true,
    eager: true,
  })
  mutatedLines!: MutatedLine[];

  @Column()
  operator!: string;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
