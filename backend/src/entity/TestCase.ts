import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exercise} from './Exercise';
import {User} from './User';

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

  @ManyToOne(() => User, user => user.testCases)
  user!: User;

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
