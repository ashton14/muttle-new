import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  getRepository,
} from 'typeorm';
import { TestCase } from './TestCase';
import { Attempt } from './Attempt';
import { Exercise } from './Exercise';
import { ExerciseOffering } from './ExerciseOffering';

@Entity('User')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @OneToMany(() => TestCase, testCase => testCase.user)
  testCases!: TestCase[];

  @OneToMany(() => Attempt, attempts => attempts.exercise)
  attempts!: Attempt[];

  @OneToMany(() => Exercise, exercises => exercises.owner)
  exercises!: Exercise[];

  @OneToMany(() => ExerciseOffering, exerciseOffering => exerciseOffering.owner)
  ownedExerciseOfferings!: ExerciseOffering[];

  @ManyToMany(() => ExerciseOffering, { eager: false })
  @JoinTable()
  exerciseOfferings!: ExerciseOffering[];

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  modified!: Date;

  static async ownedAssignments(userId: number): Promise<ExerciseOffering[]> {
    return await getRepository(ExerciseOffering).find({
      where: {
        owner: {
          id: userId,
        },
      },
      relations: ['exercise'],
    });
  }
}
