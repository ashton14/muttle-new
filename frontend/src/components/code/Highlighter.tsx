import React, {useEffect, useRef, useState} from 'react';
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
  Outcome,
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

  /**
   * If the selectedMutant changes, update the value so that the
   * CodeMirror editor displays the new selectedMutant, if any.
   */
  useEffect(() => {
    if (selectedMutant) {
      const {mutatedLines} = selectedMutant;
      const editorLines = initialValue.split(/\n/);
      mutatedLines.forEach(({lineNo, mutatedSource}) => {
        const currLine = editorLines[lineNo - 1];
        const edit = currLine.length ? mutatedSource.trim() : mutatedSource;
        editorLines[lineNo - 1] = `${editorLines[lineNo - 1]} ${edit}`;
      });
      setValue(editorLines.join('\n'));
    } else {
      setValue(initialValue);
    }
  }, [selectedMutant, initialValue]);

  // If the editor contents change, redraw the struck-out text indicating
  // code that has been mutated. If there is a selectedMutant, the original
  // line is struck out. If there is no selectedMutant, the strikeout is cleared.
  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;
    if (selectedMutant) {
      markRef.current?.clear();
      selectedMutant.mutatedLines.forEach(({lineNo}) => {
        const textAtLine = initialValue.split(/\n/)[lineNo - 1];
        const fromChar = /\w/.exec(textAtLine)?.index || 0;
        const toChar = textAtLine.length;
        markRef.current = editor.markText(
          {line: lineNo - 1, ch: fromChar},
          {line: lineNo - 1, ch: toChar},
          {className: 'strike', inclusiveRight: false}
        );
      });
    } else {
      markRef.current?.clear();
    }
    // value must be included in the dep array because this effect must run AFTER
    // the editor contents have changed. CodeMirror clears TextMarkers if the
    // value is changed.
  }, [value, initialValue, selectedMutant]);

  // If the mutationOutcomes change, unset the selectedMutant and re-set the editor
  // contents back to the original value.
  useEffect(() => {
    setSelectedMutant(null);
    setValue(initialValue);
  }, [mutationOutcomes, initialValue]);

  // If the editor value, mutationOutcomes, or selectedMutant change,
  // re-draw the mutation coverage feedback.
  useEffect(() => {
    /**
     * If the specified mutant is different from selectedMutant, sets
     * it as the selectedMutant. If they are the same, sets selectedMutant
     * to null.
     * @param mutant The MutationResult to be set as the selectedMutant.
     */
    const handleMutantSelect = (mutant: MutationResult) => {
      console.log(mutant);
      if (_.isEqual(mutant, selectedMutant)) {
        setSelectedMutant(null);
      } else {
        setSelectedMutant(mutant);
      }
    };

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
  }, [value, mutationOutcomes, selectedMutant]);

  // If the coverageOutcomes change, redraw condition coverage feedback.
  // Also redraw if the editor contents change, because CodeMirror clears
  // the gutter markers on change.
  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;

    if (editor) {
      editor.clearGutter('coverage-gutter');

      if (coverageOutcomes) {
        highlightCoverage(editor, coverageOutcomes);
      }
    }
  }, [value, coverageOutcomes]);

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
  const mutationResultsByLine = _.groupBy(
    parseMutationData(mutationOutcomes),
    mutationResult => mutationResult.mutatedLines[0].lineNo
  );

  const newWidgets: codemirror.LineWidget[] = [];

  Object.entries(
    _.mapValues(mutationResultsByLine, mutants =>
      mutants
        .filter(mutationResult => mutationResult.outcome != Outcome.KILLED)
        .sort(({outcome: o1}, {outcome: o2}) => sortOutcomes(o1, o2))
        .map(mutationResult => {
          const {outcome, operator, mutatedLines} = mutationResult;
          const isSelected = _.isEqual(mutationResult, selectedMutant);
          return (
            <MutantBadge
              outcome={outcome}
              operator={operator}
              mutatedLines={mutatedLines}
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
