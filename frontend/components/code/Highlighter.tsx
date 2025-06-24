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
import exerciseOfferings from '../../../backend/src/server/routes/exerciseOfferings';

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
  highlightedLines?: number[];

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
    console.log('selectedMutant changed:', selectedMutant);
    if (selectedMutant && selectedMutant.mutation?.mutatedLines) {
      console.log('Displaying mutated code for:', selectedMutant);
      // Only use ADDED lines if type is present, otherwise fallback to all
      const mutatedLines = selectedMutant.mutation.mutatedLines.filter(
        line => !line.type || line.type === 'ADDED'
      );
      console.log('mutatedLines:', mutatedLines);
      const editorLines = initialValue.split(/\n/);
      mutatedLines.forEach(({lineNo, mutatedSource}) => {
        console.log(`Replacing line ${lineNo} with: ${mutatedSource}`);
        editorLines[lineNo - 1] = mutatedSource;
      });
      console.log('Final editor value:', editorLines.join('\n'));
      setValue(editorLines.join('\n'));
    } else {
      console.log('Resetting to original value');
      setValue(initialValue);
    }
  }, [selectedMutant, initialValue]);

  // If the editor contents change, redraw the struck-out text indicating
  // code that has been mutated. Only apply strikethrough if the mutation is killed.
  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;
    if (
      selectedMutant &&
      selectedMutant.mutation?.mutatedLines &&
      selectedMutant.status === Status.KILLED
    ) {
      markRef.current?.clear();
      selectedMutant.mutation.mutatedLines.forEach(({lineNo, mutatedSource}) => {
        if (editor) {
          const textAtLine = value.split(/\n/)[lineNo - 1];
          // Strike through the whole mutated line for killed mutations
          markRef.current = editor.markText(
            {line: lineNo - 1, ch: 0},
            {line: lineNo - 1, ch: textAtLine.length},
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
      console.log('handleMutantSelect called with:', mutant);
      console.log('Current selectedMutant:', selectedMutant);
      console.log('Are they equal?', _.isEqual(mutant, selectedMutant));
      
      if (_.isEqual(mutant, selectedMutant)) {
        console.log('Setting selectedMutant to null');
        setSelectedMutant(null);
      } else {
        console.log('Setting selectedMutant to:', mutant);
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
        handleMutantSelect,
        exerciseOffering?.mutators
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

  useEffect(() => {
  const editor = codeMirrorRef.current?.editor;

  // Clear any previous highlights
  if (editor) {
    editor.eachLine(line => editor.removeLineClass(line, 'background', 'highlighted-line'));
  }

  // Apply the 'highlighted-line' class to each line in highlightedLines array
  if (editor && props.highlightedLines?.length) {
    props.highlightedLines.forEach(lineNo => {
      editor.addLineClass(lineNo - 1, 'background', 'highlighted-line');
    });
  }
}, [props.highlightedLines, value]); // Dependencies on highlightedLines and value


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
  handleMutantClick: Function,
  displayedMutators: string[] | undefined
) => {
  
  const mutationResultsByLine = _.groupBy(
    mutationOutcomes,
    mutationOutcome => {
      // Add safety check for mutatedLines
      if (!mutationOutcome.mutation?.mutatedLines || mutationOutcome.mutation.mutatedLines.length === 0) {
        return null; // Skip mutations without mutatedLines
      }
      return mutationOutcome.mutation.mutatedLines[0].lineNo;
    }
  );

  const newWidgets: codemirror.LineWidget[] = [];

  const struckLinesSet: Set<string> = new Set<string>();
  if (selectedMutant !== null && selectedMutant.mutation?.mutatedLines) {
    selectedMutant.mutation.mutatedLines.forEach(mutatedLine =>
      struckLinesSet.add(mutatedLine.lineNo.toString())
    );
  }

  const mutantBadges: [string, JSX.Element[]][] = Object.entries(
    _.mapValues(mutationResultsByLine, (mutants, lineNo, _object) => {
      console.log(`Line ${lineNo} has ${mutants.length} mutations:`, mutants.map(m => ({
        status: m.status,
        operator: m.mutation?.operator,
        equivalent: m.mutation?.equivalent,
        lineNo: m.mutation?.mutatedLines?.[0]?.lineNo
      })));
      
      const filteredMutants = mutants
        .filter(mutationOutcome => {
          const notEquivalent = mutationOutcome.mutation?.equivalent == false;
          const operatorIncluded = displayedMutators === undefined || displayedMutators?.includes(mutationOutcome.mutation?.operator || '');
          
          console.log(`Mutation ${mutationOutcome.mutation?.operator} (${mutationOutcome.status}): notEquivalent=${notEquivalent}, operatorIncluded=${operatorIncluded}`);
          
          return notEquivalent && operatorIncluded;
        })
        .filter(
          mutationOutcome =>
            struckLinesSet.size === 1 ||
            _.isEqual(mutationOutcome, selectedMutant) ||
            !struckLinesSet.has(lineNo)
        )
        .sort(({status: o1}, {status: o2}) => sortStatus(o1, o2))
        .map((mutationResult, i) => {
          const {status, mutation} = mutationResult;
          const isSelected = _.isEqual(mutationResult, selectedMutant);
          return (
            <MutantBadge
              status={status}
              operator={mutation?.operator || ''}
              mutatedLines={mutation?.mutatedLines || []}
              isSelected={isSelected}
              handleClick={() => handleMutantClick(mutationResult)}
              key={`mutant-${i}`}
            />
          );
        });
      
      console.log(`Line ${lineNo} has ${filteredMutants.length} filtered mutations`);
      return filteredMutants;
    })
  )
  
  mutantBadges.forEach(([line, mutants]) => {
    if (editor && line !== 'null') { // Skip null lines
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
