import { spawn } from 'child_process';
import yaml from 'js-yaml';

import { SNIPPET_FILENAME, TESTS_FILENAME } from '../../../utils/pythonUtils';
import path from 'path';
import { readFile } from 'fs/promises';
import { MutationOutcome } from '../../../entity/MutationOutcome';
import { DeepPartial } from 'typeorm/common/DeepPartial';

const ModuleType = new yaml.Type('tag:yaml.org,2002:python/module:__init__', {
  kind: 'scalar',
});
const SCHEMA = yaml.DEFAULT_SCHEMA.extend(ModuleType);

export const MUTATION_RESULTS_FILENAME = path.join('reports', 'mutation.yaml');

interface MutationReport {
  mutations: DeepPartial<MutationOutcome>[];
}

/**
 * Format in which mutated source code is extraced from stdout.
 */
interface MutatedLine {
  lineNo: number;
  mutatedSource: string;
}

interface Mutant {
  operator: string;
  number: number;
  addedLines: MutatedLine[];
  removedLines: MutatedLine[];
}

export const runMutationAnalysis = (rootDir: string) => {
  return new Promise<Mutant[]>((resolve, reject) => {
    const python = spawn('mut.py', [
      '-e',
      '--target',
      path.join(rootDir, SNIPPET_FILENAME),
      '--unit-test',
      path.join(rootDir, TESTS_FILENAME),
      '--coverage',
      '--show-mutants',
      '-r',
      path.join(rootDir, MUTATION_RESULTS_FILENAME),
    ]);

    let output = '';
    python.stderr.on('data', chunk => console.log(chunk.toString()));
    python.stdout.on('data', chunk => {
      console.log(chunk.toString());
      output = output + chunk;
    });

    python.on('close', async () => {
      try {
        const mutatedSources = getMutatedSource(output);
        resolve(mutatedSources);
      } catch (err) {
        reject(err);
      }
    });

    python.on('error', (err: Error) => {
      console.log(err);
      reject(err);
    });
  });
};

export const getMutationData = async (
  rootDir: string
): Promise<DeepPartial<MutationOutcome>[]> => {
  try {
    const resultsData = await readFile(
      path.join(rootDir, MUTATION_RESULTS_FILENAME),
      'utf-8'
    );
    const doc = yaml.load(resultsData, { schema: SCHEMA }) as MutationReport;
    return doc.mutations.map(
      (outcome): DeepPartial<MutationOutcome> => ({
        ...outcome,
      })
    );
  } catch (err) {
    console.log('Unable to read mutation analysis report');
    throw err;
  }
};

const getMutatedSource = (output: string): Mutant[] => {
  // Group 1: mutant number, Group 2: operator
  const reOperator = /^\s+-\s\[#\s+(\d+)\] (\w+)/;
  // Group 1: + or -, Group 2: line number, Group 3: source
  const reMutatedLine = /^.*(\+|-)\s+(\d+):\s+(.+)$/;

  const mutants: Mutant[] = [];
  let current = -1;

  output.split(/\n|\r/).forEach(l => {
    const opMatches = reOperator.exec(l);
    if (opMatches) {
      mutants.push({} as Mutant);
      current = mutants.length - 1;
      mutants[current] = {
        operator: opMatches[2],
        number: parseInt(opMatches[1]),
        addedLines: [],
        removedLines: [],
      };
    }

    const mutantMatches = reMutatedLine.exec(l);
    if (mutantMatches) {
      const addedOrRemoved: string = mutantMatches[1];
      const lineNumber: string = mutantMatches[2];
      const lineSource: string = mutantMatches[3];

      const newMutatedLine: MutatedLine = {
        lineNo: Number(lineNumber),
        mutatedSource: lineSource,
      };

      const currentMutant: Mutant = mutants[current];

      if (addedOrRemoved === '+') {
        currentMutant.addedLines.push(newMutatedLine);
      } else if (addedOrRemoved === '-') {
        currentMutant.removedLines.push(newMutatedLine);
      }
    }
  });
  return mutants;
};
