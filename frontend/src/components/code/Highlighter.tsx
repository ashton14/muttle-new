import React, {useEffect, useRef} from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {LANGUAGE} from '../../lib/codeMirrorSetup';

import './Highlighter.css';
import {CoverageOutcome, Mutant} from '../../lib/api';
import _ from 'lodash';

const baseOptions: Partial<codemirror.EditorConfiguration> = {
  readOnly: 'nocursor',
  mode: LANGUAGE,
};

interface HighlighterProps {
  value: string;
  options?: Partial<codemirror.EditorConfiguration>;
  coverageOutcomes?: CoverageOutcome[];
  mutants?: Mutant[];
  className?: string;
}

interface CodeMirrorWithEditor extends CodeMirror {
  editor: codemirror.Editor;
}

const Highlighter = ({
  value,
  options,
  coverageOutcomes,

  className,
}: HighlighterProps) => {
  const codeMirrorRef = useRef<CodeMirrorWithEditor>(null);

  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;

    if (editor) {
      editor.clearGutter('coverage-gutter');

      if (coverageOutcomes) {
        highlightCoverage(editor, coverageOutcomes);
      }
    }
  }, [coverageOutcomes]);

  return (
    <CodeMirror
      ref={codeMirrorRef}
      className={className}
      value={value}
      options={{...baseOptions, ...options}}
      onBeforeChange={() => {}} // No-op
      onChange={() => {}} // No-op
      editorDidMount={editor => responsiveEditorHeight(editor)}
    />
  );
};

const responsiveEditorHeight = (editor: codemirror.Editor) =>
  editor.setSize(null, 'auto');

const getCoverageGutter = (className: string) => {
  const div: HTMLElement = document.createElement('div');
  div.className = className;
  div.innerHTML = '&nbsp;';
  return div;
};

const highlightCoverage = (
  editor: codemirror.Editor,
  coverageOutcomes: CoverageOutcome[]
) => {
  const {
    covered = [],
    partial = [],
    uncovered = [],
  } = _.groupBy<CoverageOutcome>(coverageOutcomes, getOutcome);
  return [
    ...covered.map((coverageOutcome: CoverageOutcome) =>
      editor.setGutterMarker(
        coverageOutcome.lineNo - 1,
        'coverage-gutter',
        getCoverageGutter('coverage-covered')
      )
    ),
    ...partial.map((coverageOutcome: CoverageOutcome) =>
      editor.setGutterMarker(
        coverageOutcome.lineNo - 1,
        'coverage-gutter',
        getCoverageGutter('coverage-partial')
      )
    ),
    ...uncovered.map((coverageOutcome: CoverageOutcome) =>
      editor.setGutterMarker(
        coverageOutcome.lineNo - 1,
        'coverage-gutter',
        getCoverageGutter('coverage-uncovered')
      )
    ),
  ];
};

enum CoverageResult {
  UNCOVERED = 'uncovered',
  PARTIAL = 'partial',
  COVERED = 'covered',
}

const getOutcome = (coverageOutcome: CoverageOutcome) => {
  if (!coverageOutcome.lineCovered) {
    return CoverageResult.UNCOVERED;
  }

  return coverageOutcome.conditions > coverageOutcome.conditionsCovered
    ? CoverageResult.PARTIAL
    : CoverageResult.COVERED;
};

export default Highlighter;
