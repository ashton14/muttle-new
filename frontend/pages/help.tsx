import React, {useRef, useState} from 'react';
import Overlay from 'react-bootstrap/Overlay';
import ListGroup from 'react-bootstrap/cjs/ListGroup';
import Button from 'react-bootstrap/Button';
import Mutant from '../components/feedback/Mutant';
import {Status} from '../lib/api';

const MutationOperators = [
  {
    operator: 'AOD',
    description: 'arithmetic operator deletion',
  },
  {
    operator: 'AOR',
    description: 'arithmetic operator replacement',
  },
  {
    operator: 'ASR',
    description: 'assignment operator replacement',
  },
  {
    operator: 'BCR',
    description: 'break continue replacement',
  },
  {
    operator: 'COD',
    description: 'conditional operator deletion',
  },
  {
    operator: 'COI',
    description: 'conditional operator insertion',
  },
  {
    operator: 'CRP',
    description: 'constant replacement',
  },
  {
    operator: 'DDL',
    description: 'decorator deletion',
  },
  {
    operator: 'EHD',
    description: 'exception handler deletion',
  },
  {
    operator: 'EXS',
    description: 'exception swallowing',
  },
  {
    operator: 'IHD',
    description: 'hiding variable deletion',
  },
  {
    operator: 'IOD',
    description: 'overriding method deletion',
  },
  {
    operator: 'IOP',
    description: 'overridden method calling position change',
  },
  {
    operator: 'LCR',
    description: 'logical connector replacement',
  },
  {
    operator: 'LOD',
    description: 'logical operator deletion',
  },
  {
    operator: 'LOR',
    description: 'logical operator replacement',
  },
  {
    operator: 'ROR',
    description: 'relational operator replacement',
  },
  {
    operator: 'SCD',
    description: 'super calling deletion',
  },
  {
    operator: 'SCI',
    description: 'super calling insert',
  },
  {
    operator: 'SIR',
    description: 'slice index remove',
  },
];

export default () => {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <>
      <Button
        ref={target}
        onClick={() => setShow(!show)}
        variant="link"
        aria-label="Help"
      >
        <i
          className="text-light fas fa-question-circle"
          aria-hidden="true"
          title="Help"
        />
      </Button>
      <Overlay
        target={target.current}
        show={show}
        placement="bottom"
        rootClose={true}
        rootCloseEvent="click"
        onHide={() => setShow(false)}
      >
        <ListGroup>
          <ListGroup.Item className="py-1 ">
            <span className="font-weight-bold">Mutation Operators</span>
          </ListGroup.Item>
          {MutationOperators.map(({operator, description}) => (
            <ListGroup.Item key={operator} className="py-1">
              <Mutant status={Status.NONE} operator={operator} />
              {description}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Overlay>
    </>
  );
};
