import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Mutation} from './Mutation';

@Entity('MutatedLine')
export class MutatedLine {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Mutation, mutation => mutation.mutatedLines)
  mutation!: Mutation;

  @Column()
  lineNo!: number;

  @Column()
  mutatedSource!: string;
}
