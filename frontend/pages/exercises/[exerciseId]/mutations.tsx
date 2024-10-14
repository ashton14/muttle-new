import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/router';
import { Auth, useAuth } from '../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';


interface Mutation {
    number: number;
    id: number;
    operator: string;
    equivalent: boolean;
    exerciseId: number;
}[]

const Mutations = () => {
  const router = useRouter();
  const [mutations, setMutations] = useState<Mutation[]>([]);

  useEffect(() => {
    // Get mutations from query and parse it
    if (router.query.mutations) {
      const parsedMutations = JSON.parse(router.query.mutations as string);
      setMutations(parsedMutations);
    }
  }, [router.query.mutations]);

  return (
    <div>
      <h1>Mutations</h1>
      <ul>
        {mutations.map((mutation, index) => (
          <li key={index}>
            {/* Render the mutation object properties */}
            <p>ID: {mutation.id}</p>
            <p>Operator: {mutation.operator}</p>
            <p>Number: {mutation.number}</p>
            <p>Equivalent: {mutation.equivalent}</p>
            <p>Exercise ID: {mutation.exerciseId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Mutations;