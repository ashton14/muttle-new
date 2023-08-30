import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MutationOutcome } from './MutationOutcome';

@Entity('MutatedLine')
export class MutatedLine {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(
    () => MutationOutcome,
    mutationOutcome => mutationOutcome.mutatedLines
  )
  mutationOutcome!: MutationOutcome;

  @Column()
  lineNo!: number;

  @Column()
  mutatedSource!: string;
}
