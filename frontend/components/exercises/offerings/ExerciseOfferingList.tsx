import React from 'react';
import { SavedExerciseOffering } from '../../../lib/api';
import { useRouter } from 'next/router';
import { ExerciseListError, ExerciseLoader, LoadingState, LoadingStatus } from '../ExerciseList';
import _ from 'lodash';
import Link from 'next/link';
import { inviteLinkFromCode } from '../../../lib/helper';
import { Alert, Container, ListGroup } from 'react-bootstrap';

export default function ExerciseOfferingList(
  { exerciseOfferings, loadingState  }: { exerciseOfferings: SavedExerciseOffering[], loadingState: LoadingState }
) {
  const router = useRouter();
  const { status, error } = loadingState;

  const offeringGroups =
    _.chain(exerciseOfferings)
      .groupBy(o => o.exercise.id)
      .map((value, key) => {
        return (
          <div key={key}>
            <h3>Offerings of {`X${key}: ${value[0].exercise.name}`}</h3>
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
                )
              })
            }
          </div>
        )
      }).value();
  
  switch(status) {
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
            { offeringGroups }
          </ListGroup>
        </Container>
      )
  }
}
