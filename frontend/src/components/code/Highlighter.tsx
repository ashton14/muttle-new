import React from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {LANGUAGE} from './codeMirrorSetup';

import './Highlighter.css';

const baseOptions: Partial<codemirror.EditorConfiguration> = {
  readOnly: true,
  mode: LANGUAGE,
};

interface Coverable {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
}

interface HighlighterProps {
  value: string;
  options?: Partial<codemirror.EditorConfiguration>;
  coverage?: {
    covered: Coverable[];
    uncovered: Coverable[];
  };
  className?: string;
}

const Highlighter = ({
  value,
  options,
  coverage,
  className,
}: HighlighterProps) => {
  const codeMirrorRef = React.useRef();

  React.useEffect(() => {
    const editor = codeMirrorRef.current.editor;

    editor.display.wrapper.style.height = 'auto';

    if (coverage) {
      const {covered, uncovered} = coverage;
      covered.forEach(({from, to}) => {
        editor.markText(from, to, {className: 'codemirror-covered'});
      });
      uncovered.forEach(({from, to}) => {
        editor.markText(from, to, {className: 'codemirror-uncovered'});
      });
    }
  }, [coverage]);

  return (
    <CodeMirror
      ref={codeMirrorRef}
      className={className}
      value={value}
      options={{...baseOptions, ...options}}
      onBeforeChange={() => {}} // No-op
      onChange={() => {}} // No-op
    />
  );
};

export default Highlighter;
