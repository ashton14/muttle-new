import React from 'react';
import {Col, Table} from 'react-bootstrap';
import {MutationOutcome} from '../../lib/api';

import _ from 'lodash';
import MutantBadge, {Outcome, sortOutcomes} from './Mutant';
import FeedbackTableHeader from './FeedbackTableHeader';
import FeedbackRow from './FeedbackRow';

interface FeedbackTableProps {
  mutationOutcomes?: MutationOutcome[];
}

const FeedbackTable = ({mutationOutcomes}: FeedbackTableProps) => (
  <Col className="d-flex flex-column">
    <div className="h5">Feedback</div>
    <Table className="text-left" responsive="sm" size="sm">
      <FeedbackTableHeader />
      <tbody>{mutantsToRows(mutationOutcomes)}</tbody>
    </Table>
  </Col>
);

const mutantsToRows = (mutationOutcomes?: MutationOutcome[]) => {
  const mutantsByLine = _.groupBy(parseMutationData(mutationOutcomes), 'line');

  return Object.entries(
    _.mapValues(mutantsByLine, mutants =>
      mutants
        .sort(({outcome: o1}, {outcome: o2}) => sortOutcomes(o1, o2))
        .map(({outcome, operator}, index) => (
          <MutantBadge outcome={outcome} operator={operator} key={`op-${index}`}/>
        ))
    )
  ).map(([line, mutants], index) => <FeedbackRow line={line} feedback={mutants} key={`f-${index}`}/>);
};
