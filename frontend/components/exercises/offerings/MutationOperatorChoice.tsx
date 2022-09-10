import React from 'react';
import Select, { MultiValue, ActionMeta } from 'react-select';

interface MutationOperator {
  value: string;
  label: string;
  linkToInfo?: string;
}

const pythonMutationOperators: MutationOperator[] = [
  {
    value: 'AOD',
    label: 'AOD (arithmetic operator deletion)',
  },
  {
    value: 'AOR',
    label: 'AOR (arithmetic value replacement)',
  },
  {
    value: 'ASR',
    label: 'ASR (assignment operator replacement)',
  },
  {
    value: 'BCR',
    label: 'BCR (break continue replacement)',
  },
  {
    value: 'COD',
    label: 'COD (conditional operator deletion)',
  },
  {
    value: 'COI',
    label: 'COI (conditional value insertion)',
  },
  {
    value: 'CRP',
    label: 'CRP (constant replacement)',
  },
  // {
  //   value: 'DDL',
  //   label: 'DDL (decorator deletion)',
  // },
  {
    value: 'EHD',
    label: 'EHD (exception handler deletion)',
  },
  {
    value: 'EXS',
    label: 'EXS (exception swallowing)',
  },
  {
    value: 'IHD',
    label: 'IHD (hiding variable deletion)',
  },
  // {
  //   value: 'IOD',
  //   label: 'IOD (overriding method deletion)',
  // },
  // {
  //   value: 'IOP',
  //   label: 'IOP (overridden method calling position change)',
  // },
  {
    value: 'LCR',
    label: 'LCR (logical connector replacement)',
  },
  {
    value: 'LOD',
    label: 'LOD (logical operator deletion)',
  },
  {
    value: 'LOR',
    label: 'LOR (logical operator replacement)',
  },
  {
    value: 'ROR',
    label: 'ROR (relational operator replacement)',
  },
  // {
  //   value: 'SCD',
  //   label: 'SCD (super calling deletion)',
  // },
  // {
  //   value: 'SCI',
  //   label: 'SCI (super calling insert)',
  // },
  {
    value: 'SIR',
    label: 'SIR (slice index remove)',
  },
  {
    value: 'OIL',
    label: 'OIL (one iteration loop)',
  },
  {
    value: 'RIL',
    label: 'RIL (reverse iteration loop)',
  },
  {
    value: 'SDL',
    label: 'SDL (statement deletion)',
  },
  {
    value: 'SVD',
    label: 'SVD (self variable deletion)',
  },
  {
    value: 'ZIL',
    label: 'ZIL (zero iteration loop)',
  },
];

export default function MutationOperatorChoice ({
  mutationOperators,
  setMutationOperators,
}: {
  mutationOperators?: string[];
  setMutationOperators: Function;
}) {
  const onChange = (
    values: MultiValue<MutationOperator>,
    action: ActionMeta<MutationOperator>
  ) => {
    setMutationOperators(values.map(v => v.value));
  };

  return (
    <>
      <small className="form-hint">
        Information about these operators can be found on the{' '}
        <a href="https://github.com/mutpy/mutpy#mutation-operators">MutPy</a>{' '}
        website.
      </small>
      <Select
        isMulti
        options={pythonMutationOperators}
        closeMenuOnSelect={false}
        defaultValue={pythonMutationOperators.filter(m =>
          mutationOperators?.includes(m.value)
        )}
        className="w-50"
        onChange={onChange}
        placeholder="Select at least one"
      />
    </>
  );
};
