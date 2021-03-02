import Badge from 'react-bootstrap/Badge';
import React from 'react';

export enum Outcome {
  KILLED = 'killed',
  TIMEOUT = 'timeout',
  INCOMPETENT = 'incompetent',
  SURVIVED = 'survived',
  NONE = 'none',
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
}: {
  outcome: Outcome;
  operator: string;
}) => (
  <Badge
    className="mr-1"
    pill
    variant={VARIANTS_BY_OUTCOME.get(outcome) || DEFAULT_VARIANT}
  >
    {operator}
  </Badge>
);

export default React.memo(MutantBadge);
