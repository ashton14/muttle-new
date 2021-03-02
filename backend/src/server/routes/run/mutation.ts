import {spawn} from 'child_process';
import yaml from 'js-yaml';
import _ from 'lodash';

import {SNIPPET_FILENAME, TESTS_FILENAME} from '../../../utils/pythonUtils';
import path from 'path';
import {readFile} from 'fs/promises';

const ModuleType = new yaml.Type('tag:yaml.org,2002:python/module:__init__', {
  kind: 'scalar',
});
const SCHEMA = yaml.DEFAULT_SCHEMA.extend(ModuleType);

export const MUTATION_RESULTS_FILENAME = path.join('reports', 'mutation.yaml');

enum MutationStatus {
  SURVIVED = 'survived',
  TIMEOUT = 'timeout',
  INCOMPETENT = 'incompetent',
  KILLED = 'killed',
}

interface MutationReport {
  mutations: Mutation[];
}

interface Mutation {
  exception_traceback?: string;
  killer?: string;
  module?: string;
  mutations: {
    lineno: number;
    operator: string;
  }[];
  number: number;
  status: MutationStatus;
  tests_run: number;
  time: number;
}

export const runMutationAnalysis = (rootDir: string) => {
  return new Promise<void>((resolve, reject) => {
    const python = spawn('python3', [
      './venv/bin/mut.py',
      '--target',
      path.join(rootDir, SNIPPET_FILENAME),
      '--unit-test',
      path.join(rootDir, TESTS_FILENAME),
      '--coverage',
      '--show-mutants',
      '-r',
      path.join(rootDir, MUTATION_RESULTS_FILENAME),
    ]);

    python.on('close', async () => {
      try {
        resolve();
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

interface MutationData {
  survived: Mutation[];
  timeout: Mutation[];
  incompetent: Mutation[];
  killed: Mutation[];
}

export const getMutationData = async (
  rootDir: string
): Promise<MutationData> => {
  try {
    const resultsData = await readFile(
      path.join(rootDir, MUTATION_RESULTS_FILENAME),
      'utf-8'
    );
    const doc = yaml.load(resultsData, {schema: SCHEMA}) as MutationReport;

    const {
      survived = [],
      timeout = [],
      incompetent = [],
      killed = [],
    } = _.groupBy(doc.mutations, mutation => mutation.status);

    return {survived, timeout, incompetent, killed};
  } catch (err) {
    console.log('Unable to read mutation analysis report');
    throw err;
  }
};
