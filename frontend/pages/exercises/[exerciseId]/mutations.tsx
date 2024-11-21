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
  const [notAuthorized, setNotAuthorized] = useState<Boolean>(false);
  const [marked, setMarked] = useState<number[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const { getExercise, getMutations, updateMutation } = useAuthenticatedApi();
  

    
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
        localStorage.setItem('alertMessage', 'You are not authorized to view this exercise\'s mutations.');
        router.push(`/exercises/${exerciseId}`);
        setNotAuthorized(true);
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
  
  
  const handleMarkedCard = (mutationNumber: number, isMarked: boolean) => {
    if (isMarked) {
      setMarked([...marked, mutationNumber]);
    } else {
      setMarked(marked.filter(id => id !== mutationNumber));
    }
  };

  const handleSave = async () => {
 
    const updatedMutations = mutations.map((m) => ({
        ...m,
        equivalent: marked.includes(m.number), 
    }));

   for (const m of updatedMutations) {
    await updateMutation({
      ...m,
      equivalent: m.equivalent,
    });
    }
    
    setMutations(updatedMutations);

    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
    
  };

  return (
  <div>
    {showAlert && (
        <div style={{position:"fixed"}} className="alert alert-success alert-dismissible fade show" role="alert">
          Your changes have been saved.
        </div>
      )}
    <div style={{ display: 'flex', justifyContent: 'center' }}>
  <div className="cardContainer">
    <div className="headerSection">
          <h1>Mutations</h1>
          <button className='saveButton' onClick={handleSave}>Save</button>
      </div>
    </div>

    {/* Authorization Message */}
    {notAuthorized && (
      <p className="authError">
        You are not authorized to view this exercise's mutations
      </p>
    )}

    {/* Mutations List */}
    {!notAuthorized && (
      <ul>
        {mutations.map((mutation, index) => (
          <li key={index}>
            <MutationCard
              mutationNumber={mutation.number}
              operation={mutation.operator}
              original={original}
              mutated={getMutatedExercise(mutation)}
              highlightedLines={mutation.mutatedLines.map(line => line.lineNo)}
              onMarked={handleMarkedCard}
              equivalent={mutation.equivalent}
            />
          </li>
        ))}
      </ul>
    )}
    </div>
</div>

  );
};

export default Mutations;