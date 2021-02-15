import React from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {LANGUAGE} from './codeMirrorSetup';

const baseOptions: Partial<codemirror.EditorConfiguration> = {
  mode: LANGUAGE,
  lineNumbers: true,
};

interface CodeEditorProps {
  value: string;
  onChange(value: string): void;
  options?: Partial<codemirror.EditorConfiguration>;
}

const CodeEditor = ({value, onChange, options}: CodeEditorProps) => (
  <CodeMirror
    className="border rounded"
    value={value}
    options={{...baseOptions, ...options}}
    onBeforeChange={(editor, data, value) => {
      onChange(value);
    }}
    onChange={() => {}} // No-op
  />
);

export default CodeEditor;
