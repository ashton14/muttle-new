import {spawn} from 'child_process';
import yaml from 'js-yaml';

import {SNIPPET_FILENAME, TESTS_FILENAME} from '../../../utils/pythonUtils';
import path from 'path';
import {readFile} from 'fs/promises';
import {MutationOutcome} from '../../../entity/MutationOutcome';
import {DeepPartial} from 'typeorm/common/DeepPartial';

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
interface Mutant {
  operator?: string;
  number?: number;
  mutatedLine?: string;
}

export const runMutationAnalysis = (rootDir: string) => {
  return new Promise<[Mutant]>((resolve, reject) => {
    const python = spawn('python', [
      'mut.py',
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
    const doc = yaml.load(resultsData, {schema: SCHEMA}) as MutationReport;

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

const getMutatedSource = (output: string): [Mutant] => {
  const reOperator = /^\s+-\s\[#\s+(\d+)\] (\w+)/g;
  const reMutatedLine = /^.*\+\s+\d+:(.+)$/g;
  const mutants: [Mutant] = [{}];
  let current = 0;
  output.split(/\n|\r/).forEach(l => {
    const opMatches = reOperator.exec(l);
    if (opMatches) {
      if (!mutants[current]) {
        mutants.push({});
      }
      mutants[current]['operator'] = opMatches[2];
      mutants[current]['number'] = parseInt(opMatches[1]);
    }
    const mutantMatches = reMutatedLine.exec(l);
    if (mutantMatches) {
      mutants[current]['mutatedLine'] = mutantMatches[1];
      current++;
    }
  });
  return mutants;
};
