import React, {ReactNode} from 'react';

interface FeedbackRowProps {
  line: string;
  feedback: ReactNode;
}

const FeedbackRow = ({line, feedback}: FeedbackRowProps) => (
  <tr>
    <td className="text-right">{line}</td>
    <td colSpan={2}>{feedback}</td>
  </tr>
);

export default React.memo(FeedbackRow);
