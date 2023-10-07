import { Exercise, PrismaClient, User } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function seedUsers() {
  const pwd = await hashPassword('mustang');
  const users = [
    {
      email: 'professorx@muttle.org',
      password: await hashPassword('mutants'),
      name: 'Charles Xavier',
    },
  ];

  for (let i = 2; i < 51; i++) {
    users.push({
      email: `example-${i}@muttle.org`,
      password: pwd,
      name: `Example user ${i}`,
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  return await prisma.user.findMany();
}

async function seedExercises(owner: User) {
  const exercises = [
    {
      name: 'Multiply',
      description: 'Multiply the provided numbers and return the product.',
      snippet: 'def mul(x, y):\n' + '    return x * y',
      owner: { connect: { id: owner.id } },
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
      owner: { connect: { id: owner.id } },
    },
  ];

  return Promise.all([
    prisma.exercise.create({ data: exercises[0] }),
    prisma.exercise.create({ data: exercises[1] }),
  ]);
}

async function seedExerciseOfferings(owner: User, exercises: Exercise[]) {
  const exerciseOfferings = [
    {
      inviteCode: 'codeCovAllMutants',
      exercise: { connect: { id: exercises[0].id } },
      owner: { connect: { id: owner.id } },
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
      exercise: { connect: { id: exercises[1].id } },
      owner: { connect: { id: owner.id } },
      conditionCoverage: true,
      mutators: ['AOD', 'COD', 'EHD', 'IHD', 'LOD', 'SDL', 'SVD', 'ZIL'],
    },
  ];

  exerciseOfferings.forEach(async offering => {
    await prisma.exerciseOffering.create({
      data: offering,
    });
  });

  return await prisma.exerciseOffering.findMany();
}

async function seedData() {
  const users = await seedUsers();
  const exercises = await seedExercises(users[0]);
  await seedExerciseOfferings(users[0], exercises);
}

seedData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
  });
