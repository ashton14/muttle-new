import React, { useState } from 'react';

import codemirror from 'codemirror';
import dynamic from 'next/dynamic';


import { HighlighterProps } from '../../components/code/Highlighter';

const Highlighter = dynamic<HighlighterProps>(() => import('../../components/code/Highlighter'), { ssr: false });


interface MutationCardProps {
    operation: React.ReactNode
    original: React.ReactNodeArray
    mutated: React.ReactNodeArray
    highlightedLines?: number[]
}

const MutationCard: React.FC<MutationCardProps> = ({operation, original, mutated, highlightedLines}) => {

    const [isChecked, setIsChecked] = useState(false);

    
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    };

    const options = {
    lineNumbers: true,
    mode: 'python',
  };
    
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <u style={{ fontSize: "20px" }}>Mutation Operation</u>
                    <div className="operation">{operation}</div>
                    </div>
                <input
                className="select"
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                />
            </div>
            <div className="code-container">
        <div className='original-code'>
          <h5 className='code-box-header'>Original</h5>
            <Highlighter value={original.join('\n')} options={options} />
        </div>

        <div className='mutated-code'>
          <h5 className='code-box-header'>Mutated</h5>
            <Highlighter value={mutated.join('\n')} options={options} highlightedLines={highlightedLines} />
                    
        </div>
      </div>
        </div>
  );
};

export default MutationCard;
