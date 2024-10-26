import React, { Children, useState } from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
//import codemirror from 'codemirror';
import {
  LANGUAGE,
  responsiveEditorHeight,
  THEME,
} from '../../lib/codeMirrorSetup';

interface MutationCardProps {
    operation: React.ReactNode
    original: React.ReactNodeArray
    mutated: React.ReactNodeArray
}

const MutationCard: React.FC<MutationCardProps> = ({operation, original, mutated}) => {

    const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
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
          {original.map((line, index) => (
              <p className='codeLine' key={index}>&emsp;{line}</p>
            ))}
          {/* <CodeMirror
              ref={codeMirrorRef}
              className={className}
              value={value}
              options={{...baseOptions, ...options}}
              onBeforeChange={() => {}} // No-op
              onChange={() => {}} // No-op
              editorDidMount={responsiveEditorHeight}
              /> */}
        </div>

        <div className='mutated-code'>
          <h5 className='code-box-header'>Mutated</h5>
          {mutated.map((line, index) => (
              <p className='codeLine' key={index}>&emsp;{line}</p>
            ))}
          {/* <CodeMirror
              ref={codeMirrorRef}
              className={className}
              value={value}
              options={{...baseOptions, ...options}}
              onBeforeChange={() => {}} // No-op
              onChange={() => {}} // No-op
              editorDidMount={responsiveEditorHeight}
              /> */}
        </div>
      </div>
        </div>
  );
};

export default MutationCard;
