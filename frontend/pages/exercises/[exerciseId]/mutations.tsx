import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/router';
import { Auth, useAuth } from '../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';
import MutationCard from '../../../components/mutations/MutationCard';
import { Mutation } from '../../../lib/api';



const Mutations = () => {
  const router = useRouter();
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [original, setOriginal] = useState<string[]>([]);
  const exerciseId = router.query.exerciseId as string;
  

  const {getExercise, getMutations} = useAuthenticatedApi();
    
  useEffect(() => {
      //Get exercise
    const fetchExercise = async () => {
      try {
        const exercise = await getExercise(parseInt(exerciseId));
        
        if (!exercise) {
          throw new Error(`Error fetching exercise with ID ${exerciseId}`);
        }
        const lines = exercise.snippet.split('\n');
        setOriginal(lines);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchExercise();

    //mutations accessible for exercise creator only
    const fetchMutations = async () => {
      try {
        const fetchedMutations = await getMutations(parseInt(exerciseId));
        if (!fetchedMutations) {
          throw new Error(`Error fetching mutations with exercise ID ${exerciseId}`);
        }

        //MUTATEDLINES CONTAINS NECESSARY INFO FOR MUTATIONS

        setMutations(fetchedMutations);

      } catch (error) {
        console.error(error.message);
      }
    };

    fetchMutations();
    
  }, [exerciseId]);

  function getMutatedExercise(m: Mutation): string[] {
    const mutatedLines = m.mutatedLines; 
    const mutatedSnippet = original.slice()
    mutatedLines.forEach((line) => {
      mutatedSnippet[line.lineNo - 1] = line.mutatedSource
    });

    return mutatedSnippet
  }
  

  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <h1>Mutations</h1>
      <div className='cardContainer'>
        <button className='markEquivButton'>Mark as equivalent</button>
      <ul>
        {mutations.map((mutation, index) => (
          <li key={index}>
            <MutationCard
              operation={mutation.operator}
              original={original}
              mutated={getMutatedExercise(mutation)}>            
            </MutationCard>
          </li>
        ))}
      </ul>
        </div>
    </div>
  );
};

export default Mutations;