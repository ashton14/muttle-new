import React from 'react';
import Badge from 'react-bootstrap/Badge';
import {MutatedLine, MutationOutcome} from '../../lib/api';

import '../../styles/feedback/Mutant.css';

export enum Outcome {
  KILLED = 'killed',
  TIMEOUT = 'timeout',
  INCOMPETENT = 'incompetent',
  SURVIVED = 'survived',
  NONE = 'none',
}

export interface MutationResult {
  line: number;
  operator: string;
  mutatedLines: MutatedLine[];
  outcome: Outcome;
}

const values = Object.values(Outcome);

export const sortOutcomes = (o1: Outcome, o2: Outcome) =>
  values.indexOf(o1) - values.indexOf(o2);

const VARIANTS_BY_OUTCOME: Map<Outcome, string> = new Map([
  [Outcome.KILLED, 'success'],
  [Outcome.SURVIVED, 'danger'],
  [Outcome.TIMEOUT, 'warning'],
  [Outcome.INCOMPETENT, 'secondary'],
]);
const DEFAULT_VARIANT = 'primary';

const MutantBadge = ({
  outcome,
  operator,
  mutatedLines,
  isSelected,
  handleClick,
}: {
  outcome: Outcome;
  operator: string;
  mutatedLines: MutatedLine[];
  isSelected: boolean;
  handleClick: Function;
}) => {
  const performClick = () => {
    handleClick(mutatedLines);
  };

  const bugClassName = `bug ${isSelected ? 'bi-bug' : 'bi-bug-fill'}`;

  return (
    <Badge
      className="mr-1"
      pill
      role="button"
      variant={VARIANTS_BY_OUTCOME.get(outcome) || DEFAULT_VARIANT}
      onClick={performClick}
    >
      <i className={`bi ${bugClassName}`}></i>
    </Badge>
  );
};

export const parseMutationData = (
  mutationOutcomes?: MutationOutcome[]
): MutationResult[] =>
  (mutationOutcomes || []).flatMap(mutationOutcome =>
    (mutationOutcome.mutations || []).map(mutation => ({
      line: mutation.lineno,
      operator: mutation.operator,
      mutatedLines: mutation.mutatedLines,
      outcome: mutationOutcome.status as Outcome,
    }))
  );

export default React.memo(MutantBadge);
