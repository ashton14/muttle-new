import React, {useEffect, useRef, useCallback, useState} from 'react';
import {render} from 'react-dom';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {
  LANGUAGE,
  responsiveEditorHeight,
  THEME,
} from '../../lib/codeMirrorSetup';

import './Highlighter.css';
import {CoverageOutcome, MutationOutcome} from '../../lib/api';
import MutantBadge, {
  sortOutcomes,
  parseMutationData,
  MutationResult,
} from '../feedback/Mutant';
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

const Highlighter = (props: HighlighterProps) => {
  const codeMirrorRef = useRef<CodeMirror & {editor: codemirror.Editor}>(null);
  const widgetsRef = useRef<codemirror.LineWidget[]>([]);
  const markRef = useRef<codemirror.TextMarker>(null);

  const {
    value: initialValue,
    options,
    coverageOutcomes,
    mutationOutcomes,
    className,
  } = props;

  const [selectedMutant, setSelectedMutant] = useState<MutationResult>(null);
  const [value, setValue] = useState<string>(initialValue);

  const getNewEditorValue = useCallback(() => {
    if (selectedMutant) {
      const {line, mutatedLine} = selectedMutant;
      const editorLines = initialValue.split(/\n/);
      editorLines[line - 1] = `${editorLines[line - 1]} ${mutatedLine.trim()}`;
      return editorLines.join('\n');
    } else {
      return initialValue;
    }
  }, [initialValue, selectedMutant]);

  const handleMutantSelect = useCallback(
    (mutant: MutationResult) => {
      if (_.isEqual(mutant, selectedMutant)) {
        setSelectedMutant(null);
      } else {
        setSelectedMutant(mutant);
      }
    },
    [selectedMutant]
  );

  useEffect(() => {
    const newValue = getNewEditorValue();
    setValue(newValue);
  }, [selectedMutant, getNewEditorValue]);

  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;
    if (selectedMutant) {
      const {mutatedLine} = selectedMutant;
      const line = selectedMutant.line - 1;
      const textAtLine = value.split(/\n/)[line];
      const fromChar = /\w/.exec(textAtLine).index;
      const toChar = textAtLine.length - mutatedLine.trim().length - 1;
      markRef.current?.clear();
      markRef.current = editor.markText(
        {line: line, ch: fromChar},
        {line: line, ch: toChar},
        {className: 'strike', inclusiveRight: false}
      );
    } else {
      markRef.current?.clear();
    }
  }, [value, initialValue, selectedMutant]);

  useEffect(() => {
    if (mutationOutcomes?.length) {
      const editor = codeMirrorRef.current?.editor;
      widgetsRef.current?.forEach(w => w.clear());
      widgetsRef.current = displayMutationCoverage(
        editor,
        mutationOutcomes,
        selectedMutant,
        handleMutantSelect
      );
    }
  }, [value, mutationOutcomes, handleMutantSelect, selectedMutant]);

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
  mutationOutcomes: MutationOutcome[],
  selectedMutant: MutationResult,
  handleMutantClick: Function
) => {
  const mutantsByLine = _.groupBy(parseMutationData(mutationOutcomes), 'line');

  const newWidgets: codemirror.LineWidget[] = [];

  Object.entries(
    _.mapValues(mutantsByLine, mutants =>
      mutants
        .sort(({outcome: o1}, {outcome: o2}) => sortOutcomes(o1, o2))
        .map(mutationResult => {
          const {outcome, operator, mutatedLine} = mutationResult;
          const isSelected = _.isEqual(mutationResult, selectedMutant);
          return (
            <MutantBadge
              outcome={outcome}
              operator={operator}
              mutatedLine={mutatedLine}
              isSelected={isSelected}
              handleClick={() => handleMutantClick(mutationResult)}
            />
          );
        })
    )
  ).forEach(([line, mutants]) => {
    const div: HTMLElement = document.createElement('div');
    render(mutants, div);
    const lineInt = parseInt(line) - 1;
    const widget = editor.addLineWidget(lineInt, div, {
      above: true,
      handleMouseEvents: true,
    });
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
