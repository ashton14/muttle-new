import {spawn} from 'child_process';
import yaml from 'js-yaml';

import {SNIPPET_FILENAME, TESTS_FILENAME} from '../../../utils/pythonUtils';
import path from 'path';
import {readFile} from 'fs/promises';
import {User} from '../../../entity/User';
import {Exercise} from '../../../entity/Exercise';
import {MutationOutcome} from '../../../entity/MutationOutcome';
import {DeepPartial} from 'typeorm/common/DeepPartial';
import {getRepository} from 'typeorm';

const ModuleType = new yaml.Type('tag:yaml.org,2002:python/module:__init__', {
  kind: 'scalar',
});
const SCHEMA = yaml.DEFAULT_SCHEMA.extend(ModuleType);

export const MUTATION_RESULTS_FILENAME = path.join('reports', 'mutation.yaml');

export enum MutationStatus {
  SURVIVED = 'survived',
  TIMEOUT = 'timeout',
  INCOMPETENT = 'incompetent',
  KILLED = 'killed',
}

interface MutationReport {
  mutations: DeepPartial<MutationOutcome>[];
}

export const runMutationAnalysis = (rootDir: string) => {
  return new Promise<void>((resolve, reject) => {
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

export const getMutationData = async (
  rootDir: string,
  user: User,
  exercise: Exercise
): Promise<MutationOutcome[]> => {
  try {
    const resultsData = await readFile(
      path.join(rootDir, MUTATION_RESULTS_FILENAME),
      'utf-8'
    );
    const doc = yaml.load(resultsData, {schema: SCHEMA}) as MutationReport;

    const mutationOutcomes = doc.mutations.map(
      (outcome): DeepPartial<MutationOutcome> => ({...outcome, user, exercise})
    );

    return await getRepository(MutationOutcome).save(mutationOutcomes);
  } catch (err) {
    console.log('Unable to read mutation analysis report');
    throw err;
  }
};
