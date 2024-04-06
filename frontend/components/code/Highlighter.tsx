import React, {useCallback, useEffect, useRef, useState} from 'react';
import {render} from 'react-dom';

import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';
import {
  LANGUAGE,
  responsiveEditorHeight,
  THEME,
} from '../../lib/codeMirrorSetup';

import {
  CoverageOutcome,
  MutationOutcome,
  Status,
  sortStatus,
  SavedExerciseOffering,
} from '../../lib/api';
import MutantBadge from '../feedback/Mutant';
import _ from 'lodash';
import { Button } from 'react-bootstrap';

const baseOptions: Partial<codemirror.EditorConfiguration> = {
  readOnly: true,
  cursorHeight: 0,
  theme: THEME,
  mode: LANGUAGE,
};

export interface HighlighterProps {
  value: string;
  options?: Partial<codemirror.EditorConfiguration>;
  coverageOutcomes?: CoverageOutcome[];
  mutationOutcomes?: MutationOutcome[];
  className?: string;
  exerciseOffering?: SavedExerciseOffering;
}

const Highlighter = (props: HighlighterProps) => {
  const codeMirrorRef = useRef<CodeMirror & {editor: codemirror.Editor}>(null);
  const widgetsRef = useRef<codemirror.LineWidget[]>([]);
  const markRef = useRef<codemirror.TextMarker | null>(null);

  const {
    value: initialValue,
    options,
    coverageOutcomes,
    mutationOutcomes,
    className,
    exerciseOffering
  } = props;

  const [selectedMutant, setSelectedMutant] = useState<MutationOutcome | null>(
    null
  );
  const [value, setValue] = useState<string>(initialValue);
  const [showFeedback, setShowFeedback] = useState<boolean>(true);

  /**
   * Unset the selected mutant and reset the editor to its
   * original contents.
   */
  const resetEditor = useCallback(() => {
    setSelectedMutant(null);
    setValue(initialValue);
  }, [initialValue]);

  /**
   * Toggle whether or not to display feedback.
   */
  const toggleShowFeedback = () => {
    resetEditor();
    setShowFeedback(!showFeedback);
  }

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
        editorLines[lineNo - 1] = `${mutatedSource} ${currLine.trim()}`;
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
      selectedMutant.mutatedLines.forEach(({lineNo, mutatedSource}) => {
        if (editor) {
          const textAtLine = value.split(/\n/)[lineNo - 1];
          const fromChar = mutatedSource.length + 1;
          const toChar = textAtLine.length;
          markRef.current = editor.markText(
            {line: lineNo - 1, ch: fromChar},
            {line: lineNo - 1, ch: toChar},
            {className: 'strikethrough', inclusiveRight: false}
          );
        }
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
    resetEditor();
  }, [mutationOutcomes, initialValue, resetEditor]);

  // If the editor value, mutationOutcomes, or selectedMutant change,
  // re-draw the mutation coverage feedback.
  useEffect(() => {
    /**
     * If the specified mutant is different from selectedMutant, sets
     * it as the selectedMutant. If they are the same, sets selectedMutant
     * to null.
     * @param mutant The MutationOutcome to be set as the selectedMutant.
     */
    const handleMutantSelect = (mutant: MutationOutcome) => {
      if (_.isEqual(mutant, selectedMutant)) {
        setSelectedMutant(null);
      } else {
        setSelectedMutant(mutant);
      }
    };

    if (showFeedback && mutationOutcomes) {
      const editor = codeMirrorRef.current?.editor;
      widgetsRef.current?.forEach(w => w.clear());
      widgetsRef.current = displayMutationCoverage(
        editor,
        mutationOutcomes,
        selectedMutant,
        handleMutantSelect
      );
    } else {
      widgetsRef.current?.forEach(w => w.clear());
    }
  }, [value, showFeedback, mutationOutcomes, selectedMutant, exerciseOffering]);

  // If the coverageOutcomes change, redraw condition coverage feedback.
  // Also redraw if the editor contents change, because CodeMirror clears
  // the gutter markers on change.
  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;

    if (editor) {
      editor.clearGutter('coverage-gutter');

      if (showFeedback && coverageOutcomes) {
        highlightCoverage(editor, coverageOutcomes);
      }
    }
  }, [value, showFeedback, coverageOutcomes, exerciseOffering]);

  return (
    <>
      {
        (mutationOutcomes || coverageOutcomes) ?
        <Button
          className="btn btn-sm btn-secondary"
          disabled={!mutationOutcomes?.length && !coverageOutcomes?.length}
          onClick={toggleShowFeedback}>
          { showFeedback ? 'Hide Feedback' : 'Show Feedback' }
        </Button> :
        ''
      }
      <CodeMirror
        ref={codeMirrorRef}
        className={className}
        value={value}
        options={{...baseOptions, ...options}}
        onBeforeChange={() => {}} // No-op
        onChange={() => {}} // No-op
        editorDidMount={responsiveEditorHeight}
      />
    </>
  );
};

const getCoverageGutter = (className: string) => {
  const div: HTMLElement = document.createElement('div');
  div.className = className;
  div.innerHTML = '&nbsp;';
  return div;
};

const displayMutationCoverage = (
  editor: codemirror.Editor | undefined,
  mutationOutcomes: MutationOutcome[],
  selectedMutant: MutationOutcome | null,
  handleMutantClick: Function
) => {
  const mutationResultsByLine = _.groupBy(
    mutationOutcomes,
    mutationOutcome => mutationOutcome.mutatedLines[0].lineNo
  );

  const newWidgets: codemirror.LineWidget[] = [];

  const struckLinesSet: Set<string> = new Set<string>();
  if (selectedMutant !== null) {
    selectedMutant.mutatedLines.forEach(mutatedLine =>
      struckLinesSet.add(mutatedLine.lineNo.toString())
    );
  }

  const mutantBadges: [string, JSX.Element[]][] = Object.entries(
    _.mapValues(mutationResultsByLine, (mutants, lineNo, _object) =>
      mutants
        .filter(mutationOutcome => mutationOutcome.status !== Status.KILLED)
        .filter(
          mutationOutcome =>
            struckLinesSet.size === 1 ||
            _.isEqual(mutationOutcome, selectedMutant) ||
            !struckLinesSet.has(lineNo)
        )
        .sort(({status: o1}, {status: o2}) => sortStatus(o1, o2))
        .map((mutationResult, i) => {
          const {status, operator, mutatedLines} = mutationResult;
          const isSelected = _.isEqual(mutationResult, selectedMutant);
          return (
            <MutantBadge
              status={status}
              operator={operator}
              mutatedLines={mutatedLines}
              isSelected={isSelected}
              handleClick={() => handleMutantClick(mutationResult)}
              key={`mutant-${i}`}
            />
          );
        })
    )
  )
  
  mutantBadges.forEach(([line, mutants]) => {
    if (editor) {
      const div: HTMLElement = document.createElement('div');
      render(mutants, div);
      const lineInt = parseInt(line) - 1;
      const widget = editor.addLineWidget(lineInt, div, {
        above: true,
        handleMouseEvents: true,
      });
      newWidgets.push(widget);
    }
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
