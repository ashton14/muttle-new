import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
  model: {
    user: {
      /**
       * @param userId A user id
       * @returns The assignments owned by the user with the given id
       */
      async ownedAssignments(userId: number) {
        return await prisma.exerciseOffering.findMany({
          where: { ownerId: userId },
          include: { exercise: true },
        });
      },
    },
    exerciseOffering: {
      /**
       * @param userId A user id
       * @returns The assignments assigned to the user with the given id
       */
      async assignedToUser(userId: number) {
        return await prisma.exerciseOffering.findMany({
          where: {
            users: {
              some: {
                id: userId,
              },
            },
          },
          include: { exercise: true },
        });
      },
      /**
       * @param userId A user id
       * @param inviteCode An exercise offering invite code
       * @returns An exercise offering that is assigned to the user
       *  with the given id, or null if no exercise offering with the
       *  given invite code exists.
       */
      async getOrCreateAssignment(userId: number, inviteCode: string) {
        const exerciseOffering = await prisma.exerciseOffering.findUnique({
          where: { inviteCode },
        });
        if (!exerciseOffering) {
          return null;
        }
        return await prisma.exerciseOffering.update({
          where: { id: exerciseOffering.id },
          data: {
            users: {
              connect: {
                id: userId,
              },
            },
          },
          include: {
            exercise: true,
          },
        });
      },
      /**
       * Get the given user's latest attempt on the given exercise offering
       * @param userId A user id
       * @param exerciseOfferingId An exercise offering id
       * @returns An attempt, or null if the user has no attempts on the
       *  given exercise offering
       */
      async latestAttempt(userId: number, exerciseOfferingId: number) {
        const attempt = await prisma.attempt.findFirst({
          where: {
            userId,
            exerciseOfferingId,
          },
          orderBy: {
            id: 'desc',
          },
          include: {
            coverageOutcomes: true,
            mutationOutcomes: {
              include: {
                mutatedLines: true,
              },
            },
            testCases: true,
          },
        });
        return attempt;
      },
    },
  },
});
