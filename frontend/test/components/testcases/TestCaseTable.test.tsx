import React from 'react';
import {render} from '@testing-library/react';
import TestCaseTable from '../../../src/components/testcases/TestCaseTable';

describe('TestCase table', () => {
  const mockEditSavedTest = jest.fn();
  const mockEditNewTest = jest.fn();
  const mockDeleteSavedTest = jest.fn();
  const mockDeleteNewTest = jest.fn();
  const mockCreateNewTest = jest.fn();

  it('with no test cases', () => {
    const {getByText} = render(
      <TestCaseTable
        savedTests={[]}
        editSavedTest={mockEditSavedTest}
        deleteSavedTest={mockDeleteSavedTest}
        newTests={[]}
        createNewTest={mockCreateNewTest}
        editNewTest={mockEditNewTest}
        deleteNewTest={mockDeleteNewTest}
        running={false}
      />
    );
    const newTestButton = getByText('New Test');
    newTestButton.click();
    expect(mockCreateNewTest).toBeCalled();
  });
});
