import React from 'react';
import { SavedExerciseOffering } from '../../../lib/api';
import { useRouter } from 'next/router';
import { ExerciseListError, ExerciseLoader, LoadingState, LoadingStatus } from '../ExerciseList';
import _ from 'lodash';
import Link from 'next/link';
import { inviteLinkFromCode } from '../../../lib/helper';
import { Alert, Container, Table } from 'react-bootstrap';
import ClickToCopy from '../../common/ClickToCopy';

export default function ExerciseOfferingList(
  { exerciseOfferings, loadingState, owned }: 
  { exerciseOfferings: SavedExerciseOffering[],
    loadingState: LoadingState, owned: boolean
  }
) {
  const router = useRouter();
  const { status, error } = loadingState;

  const copyInviteCode = (inviteCode) => {
    navigator.clipboard.writeText(inviteCode);
  }

  exerciseOfferings.sort((o1, o2) => o1.exercise.name.localeCompare(o2.exercise.name));
  const offerings =
      exerciseOfferings
      .map(o => {
        return (
          <tr key={o.inviteCode}>
            <td>
              {o.id}
            </td>
            <td>
              {o.exercise.name}
            </td>
            <td>
              <Link href={`/assignments/${o.inviteCode}`}>
                {inviteLinkFromCode(o.inviteCode)}
              </Link>{` `}
              <ClickToCopy text={inviteLinkFromCode(o.inviteCode)}/>
            </td>
            <td>
            {
              `${new Date(o.created).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}`
            }
            </td>
            {
              owned ?
              (
                <>
                  <td>
                    <Link href={`/exercises/${o.exerciseId}/offerings/${o.id}/edit`}>
                      Edit
                    </Link>
                  </td>
                  <td>
                    <b>TODO</b>
                  </td>
                </>
              ) : ''
            }
          </tr>
        )
      });
  
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
          <Table size="sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Exercise name</th>
                <th>Invite link</th>
                <th>Created on</th>
                { owned ? (
                  <>
                  <th>Edit</th>
                  <th>Download scores</th>
                  </>
                  ) : ''
                }
              </tr>
            </thead>
            <tbody>
              { offerings }
            </tbody>
          </Table>
        </Container>
      )
  }
}
