import React, { useEffect, useState } from 'react';
import ScoresTable from '../../../../../components/exercises/offerings/ScoresTable';
import { useAuthenticatedApi } from '../../../../../lib/context/AuthenticatedApiContext';
import { AttemptFeedback, AttemptRequest, User } from '../../../../../lib/api';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';

interface Score {
  student: string;
  tests: number;
  codeCoverage: string;
  mutationCoverage: string;
  date: string;
}

const Scores: React.FC = () => {
  const router = useRouter();
  const { query } = router;
  const params = Object.values(query);
  const exerciseId = params[params.length - 2];
  const offeringID = params[params.length - 1];

  const [scores, setScores] = useState<Score[]>([]);
  const { getUsers, getLatestAttemptByUser } = useAuthenticatedApi();

  const fetchScores = async () => {
    try {
      const fetchedUsers = await getUsers();

      if (!fetchedUsers) {
        throw new Error(`Error fetching users`);
      }

      const scoresData = await Promise.all(
        fetchedUsers.map(async (user) => {
          const attempt: AttemptFeedback | null = await getLatestAttemptByUser({
            userId: user.id,
            exerciseId: Number(exerciseId),
            exerciseOfferingId: Number(offeringID),
          });

          const numLines = attempt?.coverageOutcomes?.length || 0;
          let numLinesCovered = 0;

          attempt?.coverageOutcomes?.forEach((l) => {
            numLinesCovered += l.lineCovered ? 1 : 0;
          });

          const codeCoverage = (numLines > 0 ? numLinesCovered / numLines : 0) * 100;

          const numMutations = attempt?.mutationOutcomes?.length || 0;
          let numMutationsKilled = 0;

          attempt?.mutationOutcomes?.forEach((m) => {
            numMutationsKilled += m.status === 'KILLED' ? 1 : 0;
          });

          const mutationCoverage = (numMutations > 0 ? numMutationsKilled / numMutations : 0) * 100;

          const attemptDate = attempt?.created
            ? new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date(attempt.created))
            : 'N/A';

          return {
            student: `${user.name} (${user.email})`,
            tests: attempt?.testCases?.length || 0,
            codeCoverage: `${codeCoverage.toFixed(2)}%` || 'N/A',
            mutationCoverage: `${mutationCoverage.toFixed(2)}%` || 'N/A',
            date: attemptDate,
          };
        })
      );

      setScores(scoresData);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const downloadCSV = () => {
    const headers = ['Student', 'Number of Tests', 'Code Coverage', 'Mutation Coverage', 'Latest Attempt'];
    const csvRows = [
      headers.join(','), // Join headers with commas
      ...scores.map((score) =>
        [
          score.student,
          score.tests,
          score.codeCoverage,
          score.mutationCoverage,
          score.date,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'scores.csv';
    a.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div>
      <h1>Scores</h1>
      <Button onClick={downloadCSV} style={{ margin: '0px 10px 10px' }}>
        Download CSV
      </Button>
      <ScoresTable scores={scores} />
    </div>
  );
};

export default Scores;
