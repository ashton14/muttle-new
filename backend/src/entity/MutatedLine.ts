import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import {Mutation} from './Mutation';
  
  @Entity('MutatedLine')
  export class MutatedLine {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @OneToMany(
    () => Mutation,
      mutation => mutation.mutatedLines
    )
    mutation!: Mutation;

    @Column()
    lineno!: number;

    @Column()
    operator!: string;
  }