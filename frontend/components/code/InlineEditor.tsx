import React from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {
  LANGUAGE,
  responsiveEditorHeight,
  THEME,
} from '../../lib/codeMirrorSetup';

const baseOptions: Partial<codemirror.EditorConfiguration> = {
  mode: LANGUAGE,
  lineNumbers: false,
  gutters: false,
  tabindex: 0,
  extraKeys: {
    Tab: false,
    Enter: () => {},
    Return: () => {},
  },
};

export interface InlineEditorProps {
  value: string;
  onChange(value: string): void;
  readOnly?: boolean;
  options?: Partial<codemirror.EditorConfiguration>;
}

const InlineEditor = React.forwardRef(
  ({value, onChange, readOnly, options}: InlineEditorProps, ref) => {
    const derivedOptions = {
      readOnly,
      theme: readOnly ? `${THEME} readonly` : THEME,
      cursorHeight: readOnly ? 0 : 1,
    };

    return (
      <CodeMirror
        ref={ref}
        className="border rounded"
        value={value}
        options={{...baseOptions, ...options, ...derivedOptions}}
        onBeforeChange={(editor, data, value) => {
          onChange(value);
        }}
        onChange={() => {}} // No-op
        editorDidMount={responsiveEditorHeight}
      />
    );
  }
);

export default InlineEditor;
