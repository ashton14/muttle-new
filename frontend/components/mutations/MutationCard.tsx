import React, { useEffect, useState } from 'react';

import codemirror from 'codemirror';
import dynamic from 'next/dynamic';


import { HighlighterProps } from '../../components/code/Highlighter';

const Highlighter = dynamic<HighlighterProps>(() => import('../../components/code/Highlighter'), { ssr: false });


interface MutationCardProps {
    mutationNumber: number
    operation: React.ReactNode
    original: React.ReactNodeArray
    mutated: React.ReactNodeArray
    highlightedLines?: number[]
    onMarked: (mutationNumber: number, isMarked: boolean) => void
    equivalent: boolean
}

const MutationCard: React.FC<MutationCardProps> = ({mutationNumber, operation, original, mutated, highlightedLines, onMarked, equivalent}) => {

    const [isChecked, setIsChecked] = useState(equivalent);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        onMarked(mutationNumber, !isChecked)
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
                <div className="checkbox-container">
            <input
                className="select"
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                id="mark-equiv"
            />
            <div className="label-container">
                <label htmlFor="mark-equiv">Mark as Equivalent</label>
                <span className="secondary-text">Equivalent mutations will not be displayed</span>
            </div>
        </div>
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
