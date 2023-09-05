import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exercise } from './Exercise';

@Entity('Mutation')
export class Mutation {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Exercise, exercise => exercise.mutations)
  exercise!: Exercise;

  @Column()
  number!: number;

  @Column('text')
  operator!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  modified!: Date;
}
