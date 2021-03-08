import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import TestCaseRow from '../../../src/components/testcases/TestCaseRow';

describe('TestCase table', () => {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  const container = document.body.appendChild(table).appendChild(tableBody);

  let inputValue = '';
  let outputValue = '';

  const mockSetInput = jest.fn(value => {
    inputValue = value;
  });
  const mockSetOutput = jest.fn(value => {
    outputValue = value;
  });
  const mockDelete = jest.fn();

  const setup = () => {
    const utils = render(
      <TestCaseRow
        input={inputValue}
        output={outputValue}
        setInput={mockSetInput}
        setOutput={mockSetOutput}
        deleteTestCase={mockDelete}
      />,
      {container}
    );
    const input = utils.getByLabelText('test-input') as HTMLInputElement;
    const output = utils.getByLabelText('test-output') as HTMLInputElement;
    return {
      input,
      output,
      ...utils,
    };
  };

  it('calls deleteTestCase fn on "delete" button click', () => {
    const {getByRole} = setup();
    getByRole('button', {name: 'delete'}).click();
    expect(mockDelete).toBeCalled();
  });

  it('calls setInput/Output on input events', () => {
    const {input, output, rerender} = setup();

    const inputText = 'testInput';
    const outputText = 'testOutput';

    fireEvent.change(input, {target: {value: inputText}});
    expect(mockSetInput).toBeCalledWith(inputText);
    fireEvent.change(output, {target: {value: outputText}});
    expect(mockSetOutput).toBeCalledWith(outputText);

    rerender(
      <TestCaseRow
        input={inputValue}
        output={outputValue}
        setInput={mockSetInput}
        setOutput={mockSetOutput}
        deleteTestCase={mockDelete}
      />
    );

    expect(input.value).toBe(inputText);
    expect(output.value).toBe(outputText);
  });
});
