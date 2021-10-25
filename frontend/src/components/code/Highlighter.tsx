import React, {useEffect, useRef} from 'react';
import {renderToString} from 'react-dom/server';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {
  LANGUAGE,
  responsiveEditorHeight,
  THEME,
} from '../../lib/codeMirrorSetup';

import './Highlighter.css';
import {CoverageOutcome, MutationOutcome} from '../../lib/api';
import MutantBadge, {Outcome, sortOutcomes} from '../feedback/Mutant';
import {parseMutationData} from '../feedback/FeedbackTable';
import _ from 'lodash';

const baseOptions: Partial<codemirror.EditorConfiguration> = {
  readOnly: true,
  cursorHeight: 0,
  theme: THEME,
  mode: LANGUAGE,
};

interface HighlighterProps {
  value: string;
  options?: Partial<codemirror.EditorConfiguration>;
  coverageOutcomes?: CoverageOutcome[];
  mutationOutcomes?: MutationOutcome[];
  className?: string;
}

const Highlighter = ({
  value,
  options,
  coverageOutcomes,
  mutationOutcomes,
  className,
}: HighlighterProps) => {
  const codeMirrorRef = useRef<CodeMirror & {editor: codemirror.Editor}>(null);
  const widgetsRef = useRef<codemirror.LineWidget[]>([]);

  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;

    if (editor) {
      editor.clearGutter('coverage-gutter');

      if (coverageOutcomes) {
        highlightCoverage(editor, coverageOutcomes);
      }

      if (mutationOutcomes?.length) {
        widgetsRef.current?.forEach(w => w.clear());
        widgetsRef.current = displayMutationCoverage(editor, mutationOutcomes);
      }
    }
  }, [coverageOutcomes, mutationOutcomes]);

  return (
    <CodeMirror
      ref={codeMirrorRef}
      className={className}
      value={value}
      options={{...baseOptions, ...options}}
      onBeforeChange={() => {}} // No-op
      onChange={() => {}} // No-op
      editorDidMount={responsiveEditorHeight}
    />
  );
};

const getCoverageGutter = (className: string) => {
  const div: HTMLElement = document.createElement('div');
  div.className = className;
  div.innerHTML = '&nbsp;';
  return div;
};

const displayMutationCoverage = (
  editor: codemirror.Editor,
  mutationOutcomes: MutationOutcome[]
) => {
  const mutantsByLine = _.groupBy(parseMutationData(mutationOutcomes), 'line');

  const newWidgets: codemirror.LineWidget[] = [];

  Object.entries(
    _.mapValues(mutantsByLine, mutants =>
      mutants
        .sort(({outcome: o1}, {outcome: o2}) => sortOutcomes(o1, o2))
        .map(({outcome, operator}) => {
          return <MutantBadge outcome={outcome} operator={operator} />;
        })
    )
  ).forEach(([line, mutants]) => {
    const div: HTMLElement = document.createElement('div');
    const badges = mutants.map(m => renderToString(m)).join('');
    div.innerHTML = badges;
    const lineInt = parseInt(line) - 1;
    const widget = editor.addLineWidget(lineInt, div, {above: true});
    newWidgets.push(widget);
  });

  return newWidgets;
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
