import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {TestCase} from './TestCase';
import {Attempt} from './Attempt';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({unique: true})
  sessionId!: string;

  @OneToMany(() => TestCase, testCase => testCase.user)
  testCases!: TestCase[];

  @OneToMany(() => Attempt, attempts => attempts.exercise)
  attempts!: Attempt[];
}
