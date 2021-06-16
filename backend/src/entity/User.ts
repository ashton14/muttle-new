import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {TestCase} from './TestCase';
import {Attempt} from './Attempt';
import {Role} from './Role';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({unique: true})
  email!: string;

  @Column()
  password!: string;

  // TODO - Use Role table (for housing roles that may later be attached to
  //  specific permissions for courses, edit/view privileges, etc.)
  // @ManyToMany(() => Role, {eager: true})
  // @JoinTable()
  // userRoles!: Role[];

  @Column()
  role!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @OneToMany(() => TestCase, testCase => testCase.user)
  testCases!: TestCase[];

  @OneToMany(() => Attempt, attempts => attempts.exercise)
  attempts!: Attempt[];

  @CreateDateColumn({type: 'timestamp'})
  created!: Date;

  @UpdateDateColumn({type: 'timestamp'})
  modified!: Date;
}
