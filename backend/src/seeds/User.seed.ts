import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '../entity/User';
import { hashPassword } from '../utils/auth';

export default class CreateUsers implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const pwd = await hashPassword('mustang');
    const seedUsers = [
      {
        id: 1,
        email: 'professorx@muttle.org',
        password: await hashPassword('mutants'),
        name: 'Charles Xavier',
        created: new Date(),
        updated: new Date(),
      },
    ];

    for (let i = 2; i < 51; i++) {
      seedUsers.push({
        id: i,
        email: `example-${i}@muttle.org`,
        password: pwd,
        name: `Example user ${i}`,
        created: new Date(),
        updated: new Date(),
      });
    }

    return await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(seedUsers)
      .execute();
  }
}
