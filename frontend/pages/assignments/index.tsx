import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, ListGroup } from 'react-bootstrap';
import _ from 'lodash';
import { ExerciseListError, ExerciseListItem, ExerciseLoader, LoadingState, LoadingStatus } from '../../components/exercises/ExerciseList';
import { SavedExerciseOffering } from '../../lib/api';
import { useAuth } from '../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../lib/context/AuthenticatedApiContext';
import Link from 'next/link';
import { inviteLinkFromCode } from '../../lib/helper';

const ExerciseOfferingList = () => {
  const router = useRouter();
  const [{status, error}, setLoading] = useState<LoadingState>({
    status: LoadingStatus.LOADING,
  });

  const [exerciseOfferings, setExerciseOfferings] = useState<SavedExerciseOffering[]>([]);
  const { getUserAssignments } = useAuthenticatedApi();
  const { authInfo: { userInfo } } = useAuth();

  useEffect(() => {
    if (userInfo) {
      getUserAssignments(userInfo.id)
        .then(exerciseOfferings => {
          setExerciseOfferings(exerciseOfferings);
          setLoading({ status: LoadingStatus.DONE });
        })
        .catch(err => {
          setLoading({ status: LoadingStatus.ERROR, error: err });
        });
    }
  }, [getUserAssignments, userInfo]);

  const offeringGroups = 
    _.chain(exerciseOfferings)
      .groupBy(o => o.exercise.id)
      .map((value, key) => {
        return (
          <div key={key}>
            <h3>Your offerings of {`X${key}: ${value[0].exercise.name}`}</h3>
            {
              value.map(o => {
                return (
                  <div key={o.inviteCode}>
                    <Link href={`/assignments/${o.inviteCode}`}>
                      {inviteLinkFromCode(o.inviteCode)}
                    </Link>{` `}
                    {
                      `Created ${new Date(o.created).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}`
                    }
                  </div>
                )}
              )
            }
          </div>
        )
      }).value();
  
  switch (status) {
    case LoadingStatus.LOADING:
      return <ExerciseLoader />;
    case LoadingStatus.ERROR:
      return <ExerciseListError error={error} />;
    case LoadingStatus.DONE:
      return (
        <Container>
          {router?.query?.message ? (
            <Alert variant="danger">{router.query.message}</Alert>
          ) : (
            ''
          )}
          <ListGroup className="w-auto my-2">
            {
              offeringGroups
            }
            {/* {exerciseOfferings.map(offering => (
              <ExerciseListItem key={offering.exercise.id} exercise={offering.exercise} />
            ))} */}
          </ListGroup>
          <Button href="/exercises/new">
            <i className="fas fa-plus-square" aria-hidden="true" /> New Exercise
          </Button>
        </Container>
      );
  }
}

export default ExerciseOfferingList;
