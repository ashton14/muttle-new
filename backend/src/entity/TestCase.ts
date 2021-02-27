import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exercise} from './Exercise';

@Entity('TestCase')
export class TestCase {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({nullable: true})
  input!: string;

  @Column({nullable: true})
  output!: string;

  @ManyToOne(() => Exercise, exercise => exercise.testCases)
  exercise!: Exercise;

  @Column({nullable: true})
  fixedId?: number;

  @Column({nullable: true})
  passed?: boolean;

  @Column({nullable: true})
  actual?: string;

  @Column({nullable: true, default: true})
  visible!: boolean;

  @Column({nullable: true})
  errorMessage?: string;

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
