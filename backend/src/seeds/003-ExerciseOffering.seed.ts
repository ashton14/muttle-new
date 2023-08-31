import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { ExerciseOffering } from '../entity/ExerciseOffering';
import { User } from '../entity/User';
import { Exercise } from '../entity/Exercise';

export default class CreateExerciseOfferings implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const userRepo = connection.getRepository(User);
    const owner = await userRepo.findOne({ id: 1 });
    const exerciseRepo = connection.getRepository(Exercise);
    
    const seedExerciseOfferings = [
      {
        inviteCode: 'codeCovAllMutants',
        exercise: await exerciseRepo.findOne({ id: 1 }),
        owner: owner,
        conditionCoverage: true,
        mutators: [
          'AOD',
          'AOR',
          'ASR',
          'BCR',
          'COD',
          'COI',
          'CRP',
          'EHD',
          'EXS',
          'IHD',
          'LCR',
          'LOD',
          'LOR',
          'ROR',
          'SIR',
          'OIL',
          'RIL',
          'SDL',
          'SVD',
          'ZIL',
        ],
      },
      {
        inviteCode: 'codeCovDeletionOneTest',
        exercise: await exerciseRepo.findOne({ id: 2 }),
        owner: owner,
        conditionCoverage: true,
        mutators: ['AOD', 'COD', 'EHD', 'IHD', 'LOD', 'SDL', 'SVD', 'ZIL'],
      },
    ];
    return await connection
      .createQueryBuilder()
      .insert()
      .into(ExerciseOffering)
      .values(seedExerciseOfferings)
      .execute();
  }
}
