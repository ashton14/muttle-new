import React, { Children, useState, useCallback, useEffect, useRef } from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import dynamic from 'next/dynamic';


import { HighlighterProps } from '../../components/code/Highlighter';

const Highlighter = dynamic<HighlighterProps>(() => import('../../components/code/Highlighter'), { ssr: false });


import {
  //LANGUAGE,
  responsiveEditorHeight,
  //THEME,
} from '../../lib/codeMirrorSetup';

//imports not working? 

const LANGUAGE = 'python'
const THEME = 'idea'


const baseOptions: Partial<codemirror.EditorConfiguration> = {
  readOnly: true,
  cursorHeight: 0,
  theme: THEME,
  mode: LANGUAGE,
};


interface MutationCardProps {
    operation: React.ReactNode
    original: React.ReactNodeArray
    mutated: React.ReactNodeArray
    //options?: Partial<codemirror.EditorConfiguration>;

}

const MutationCard: React.FC<MutationCardProps> = ({operation, original, mutated, /*options*/}) => {

    const [isChecked, setIsChecked] = useState(false);

    const codeMirrorRef = useRef<CodeMirror & {editor: codemirror.Editor}>(null);
    const widgetsRef = useRef<codemirror.LineWidget[]>([]);
    const markRef = useRef<codemirror.TextMarker | null>(null);

    
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
                    <Highlighter value={mutated.join('\n')} options={options} />
                    
        </div>
      </div>
        </div>
  );
};

export default MutationCard;
