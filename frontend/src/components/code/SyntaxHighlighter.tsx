import React from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {LANGUAGE} from './codeMirrorSetup';

const baseOptions = {
  readOnly: 'nocursor',
  mode: LANGUAGE,
};

interface HighlightProps {
  value: string;
  options?: Partial<codemirror.EditorConfiguration>;
  className?: string;
}

const SyntaxHighlighter = ({value, options, className}: HighlightProps) => {
  const codemirrorRef = React.useRef();

  React.useEffect(() => {
    codemirrorRef.current.editor.display.wrapper.style.height = 'auto';
  });

  return (
    <CodeMirror
      ref={codemirrorRef}
      className={className}
      value={value}
      options={{...baseOptions, ...options}}
      onBeforeChange={() => {}} // No-op
      onChange={() => {}} // No-op
    />
  );
};

export default SyntaxHighlighter;
