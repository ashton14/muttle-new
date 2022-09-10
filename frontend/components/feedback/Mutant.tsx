import React from 'react';
import Badge from 'react-bootstrap/Badge';
import {MutatedLine, Status} from '../../lib/api';

import styles from './Mutant.module.css';

const VARIANTS_BY_STATUS: Map<Status, string> = new Map([
  [Status.KILLED, 'success'],
  [Status.SURVIVED, 'danger'],
  [Status.TIMEOUT, 'warning'],
  [Status.INCOMPETENT, 'secondary'],
]);
const DEFAULT_VARIANT = 'primary';

const MutantBadge = ({
  status,
  operator,
  mutatedLines,
  isSelected,
  handleClick,
}: {
  status: Status;
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
      variant={VARIANTS_BY_STATUS.get(status) || DEFAULT_VARIANT}
      onClick={performClick}
    >
      <i className={`bi ${styles.bug} ${bugClassName}`}></i>
    </Badge>
  );
};

// export const parseMutationData = (
//   mutationOutcomes?: MutationOutcome[]
// ): MutationResult[] =>
//   (mutationOutcomes || []).flatMap(mutationOutcome =>
//     (mutationOutcome.mutations || []).map(mutation => ({
//       line: mutation.lineNo,
//       operator: mutation.operator,
//       mutatedLines: mutation.mutatedLines,
//       outcome: mutationOutcome.status as Outcome,
//     }))
//   );

export default React.memo(MutantBadge);
