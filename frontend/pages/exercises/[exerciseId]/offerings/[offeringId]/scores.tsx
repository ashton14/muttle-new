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
          
        const numLines = attempt?.coverageOutcomes?.length || 0; 
        let numLinesCovered = 0;

        attempt?.coverageOutcomes?.forEach((l) => {
        numLinesCovered += l.lineCovered ? 1 : 0; 
        });

        const codeCoverage = (numLines > 0 ? numLinesCovered / numLines : 0) * 100;
          
        const numMutations = attempt?.mutationOutcomes?.length || 0; 
        let numMutationsKilled = 0;

        attempt?.mutationOutcomes?.forEach((m) => {
        numMutationsKilled += m.status === "KILLED" ? 1 : 0; 
        });

        const mutationCoverage = (numMutations > 0 ? numMutationsKilled / numMutations : 0) * 100;
        
        return {
          student: `${user.name} (${user.email})`, 
          tests: attempt?.testCases?.length || 0, // Number of test cases
          codeCoverage: `${codeCoverage.toFixed(2)}%` || 'N/A', 
          mutationCoverage: `${mutationCoverage.toFixed(2)}%` || 'N/A'
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
