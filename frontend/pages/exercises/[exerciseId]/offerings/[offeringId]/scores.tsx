import React, { useEffect, useState } from 'react';
import ScoresTable from '../../../../../components/exercises/offerings/ScoresTable';
import { useAuthenticatedApi } from '../../../../../lib/context/AuthenticatedApiContext';
import { AttemptFeedback, AttemptRequest, User } from '../../../../../lib/api';
import { useRouter } from 'next/router';

interface Score {
  student: string;
  tests: number;
  codeCoverage: string;
  mutationCoverage: string;
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
        // Fetch the latest attempt for this specific user
        const attempt: AttemptFeedback | null = await getLatestAttemptByUser({
          userId: user.id, // Specific to this user
          exerciseId: Number(exerciseId), // Replace with dynamic value if needed
          exerciseOfferingId: Number(offeringID) // Replace with dynamic value if needed
        });

        // Return scores for this user, even if no attempt exists
        return {
          student: `${user.name} (${user.email})`, // Format name and email
          tests: attempt?.testCases?.length || 0, // Number of test cases, default to 0
          codeCoverage: '0',//attempt?.coverageOutcomes?.[0] || 'N/A', // Default to 'N/A'
          mutationCoverage: '0'//attempt?.mutationOutcomes?.[0] || 'N/A', // Default to 'N/A'
        };
      })
    );

    setScores(scoresData); 
  } catch (error) {
    console.error('Error fetching scores:', error);
  }
};


  useEffect(() => {
    fetchScores();
  }, []);
    
    

  return (
    <div>
      <h1>Scores</h1>
      <ScoresTable scores={scores} />
    </div>
  );
};

export default Scores;
