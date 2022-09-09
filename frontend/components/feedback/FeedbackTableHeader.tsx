import React from 'react';
import Mutant, {Outcome} from './Mutant';

const FeedbackTableHeader = () => (
  <thead>
    <tr>
      <th className="text-right">Line</th>
      <th>Mutants</th>
      <th>
        <Mutant outcome={Outcome.KILLED} operator="Killed" />
        <Mutant outcome={Outcome.TIMEOUT} operator="Timeout" />
        <Mutant outcome={Outcome.INCOMPETENT} operator="Incompetent" />
        <Mutant outcome={Outcome.SURVIVED} operator="Survived" />
      </th>
    </tr>
  </thead>
);

export default React.memo(FeedbackTableHeader);
