import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

// TODO - Can develop a more complex permission-based model for managing
//  courses/offerings if necessary
export enum RoleLevel {
  STUDENT,
  INSTRUCTOR,
  ADMIN,
}

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({unique: true})
  roleName!: string;

  @Column()
  roleLevel!: RoleLevel;
}
