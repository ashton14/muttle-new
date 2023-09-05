import {
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
export class User {
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

  /**
   * @param userId A user id
   * @returns The assignments owned by the given user.
   */
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

  /**
   * @param userId A user id
   * @returns  The assignments (exercise offerings) assigned to the given user.
   */
  static async withExerciseOfferings(userId: number): Promise<User> {
    return await getRepository(User).findOneOrFail({
      where: {
        id: userId,
      },
      relations: ['exerciseOfferings'],
    });
  }

  /**
   * Gets the exercise offering with the given invite code. Creates an
   * association between the user and exercise offering if one doesn't
   * exist yet.
   * @param userId A user id
   * @param inviteCode An exercise offering invite code
   * @returns An exercise offering that is assigned to the user, or null
   *  if no exercise offering with the given invite code exists.
   */
  static async getOrCreateAssignment(userId: number, inviteCode: string) {
    const userRepo = getRepository(User);
    const exerciseOfferingRepo = getRepository(ExerciseOffering);
    const exerciseOffering = await exerciseOfferingRepo.findOne({
      where: {
        inviteCode,
      },
    });

    if (exerciseOffering) {
      const user = await User.withExerciseOfferings(userId);
      if (!user.exerciseOfferings.includes(exerciseOffering)) {
        // Assign the exercise offering to the user.
        user.exerciseOfferings.push(exerciseOffering);
        userRepo.save(user);
      }
      return exerciseOffering;
    } else {
      return null;
    }
  }
}
