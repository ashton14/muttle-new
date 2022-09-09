import React from 'react';
import {Button} from 'react-bootstrap';

interface NewTestRowProps {
  disabled: boolean;
  createNewTest(): void;
}

const NewTestRow = ({disabled, createNewTest}: NewTestRowProps) => (
  <tr>
    <td colSpan={4}>
      <Button
        size="sm"
        className="w-100"
        onClick={createNewTest}
        disabled={disabled}
      >
        <i className="fas fa-plus-square" aria-hidden="true" /> New Test
      </Button>
    </td>
  </tr>
);

export default React.memo(NewTestRow);
