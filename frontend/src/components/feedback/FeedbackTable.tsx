import React from 'react';
import {Col, Table} from 'react-bootstrap';
import {Mutant, MutationData} from '../../lib/api';

import _ from 'lodash';
import MutantBadge, {Outcome, sortOutcomes} from './Mutant';
import FeedbackTableHeader from './FeedbackTableHeader';
import FeedbackRow from './FeedbackRow';

interface FeedbackTableProps {
  mutation?: MutationData;
}

const FeedbackTable = ({mutation}: FeedbackTableProps) => (
  <Col className="d-flex flex-column">
    <div className="h5">Feedback</div>
    <Table className="text-left" responsive="sm" size="sm">
      <FeedbackTableHeader />
      <tbody>{mutantsToRows(mutation)}</tbody>
    </Table>
  </Col>
);

const mutantsToRows = (mutation?: MutationData) => {
  const mutantsByLine = _.groupBy(parseMutationData(mutation), 'line');

  return Object.entries(
    _.mapValues(mutantsByLine, mutants =>
      mutants
        .sort(({outcome: o1}, {outcome: o2}) => sortOutcomes(o1, o2))
        .map(({outcome, operator}) => (
          <MutantBadge outcome={outcome} operator={operator} />
        ))
    )
  ).map(([line, mutants]) => <FeedbackRow line={line} feedback={mutants} />);
};

interface MutationResult {
  line: number;
  operator: string;
  outcome: Outcome;
}

const parseMutationData = (mutation?: MutationData): MutationResult[] =>
  Object.entries(mutation || {}).flatMap(([outcome, mutants]) =>
    mutants.flatMap((mutant: Mutant) =>
      mutant.mutations.map(mutation => ({
        line: mutation.lineno,
        operator: mutation.operator,
        outcome: outcome as Outcome,
      }))
    )
  );

export default React.memo(FeedbackTable);
