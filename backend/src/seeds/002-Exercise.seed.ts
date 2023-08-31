import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Exercise } from '../entity/Exercise';
import { User } from '../entity/User';

export default class CreateExercises implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const userRepo = connection.getRepository(User);
    const owner = await userRepo.findOne({ id: 1 });
    const seedExercises = [
      {
        name: 'Multiply',
        description: 'Multiply the provided numbers and return the product.',
        snippet: 'def mul(x, y):\n' + '    return x * y',
        created: new Date(),
        modified: new Date(),
        owner: owner,
      },
      {
        name: 'Rainfall problem',
        description:
          "Let's imagine that you have a list that contains amounts of rainfall for each day, collected by a meteorologist. Her rain gathering equipment occasionally makes a mistake and reports a negative amount for that day. We have to ignore those. We need to write a program to (a) calculate the total rainfall by adding up all the positive integers (and only the positive integers), (b) count the number of positive integers, and (c) return the average rainfall at the end. Only print the average if there was some rainfall, otherwise return 0.",
        snippet:
          'def rainfall(rain):\n' +
          '    total = 0\n' +
          '    count = 0\n\n' +
          '    for r in rain:\n' +
          '        if r >= 0:\n' +
          '            total = total + r\n' +
          '            count = count + 1\n\n' +
          '    if count == 0:\n' +
          '        return 0\n' +
          '    else:\n' +
          '        return total / count',
        created: new Date(),
        modified: new Date(),
        owner: owner,
      },
    ];

    return await connection
      .createQueryBuilder()
      .insert()
      .into(Exercise)
      .values(seedExercises)
      .execute();
  }
}
