import xml2js from 'xml2js';
import { parseBooleans, parseNumbers } from 'xml2js/lib/processors';
import path from 'path';
import { readFile } from 'fs/promises';
import { CoverageOutcome } from '@prisma/client';

export const COVERAGE_RESULTS_FILENAME = path.join('reports', 'coverage.xml');

export interface CovReport {
  coverage: {
    packages: {
      package: {
        classes: {
          class: {
            lines: {
              line: {
                ['$']: CovLine;
              }[];
            }[];
          }[];
        }[];
      }[];
    }[];
  };
}

export interface CovLine {
  number: number;
  hits: number;
  branch?: boolean;
  'missing-branches'?: string;
  'condition-coverage'?: string;
}

const parseHits = (value: string, name: string) => {
  return name === 'hits' ? parseNumbers(value) : value;
};

const parseLineNumber = (value: string, name: string) => {
  return name === 'number' ? parseNumbers(value) : value;
};

const parseBranch = (value: string, name: string) => {
  return name === 'branch' ? parseBooleans(value) : value;
};

type PartialCoverageOutcome = Omit<CoverageOutcome, 'id' | 'attemptId'>;

export const getCoverageData = async (
  rootDir: string
): Promise<PartialCoverageOutcome[]> => {
  try {
    const coverageData = await readFile(
      path.join(rootDir, COVERAGE_RESULTS_FILENAME),
      'utf-8'
    );
    const xmlParser = new xml2js.Parser({
      attrValueProcessors: [parseHits, parseLineNumber, parseBranch],
    });
    const covReport: CovReport = await xmlParser.parseStringPromise(
      coverageData
    );
    const lines = getAllLines(covReport);

    return lines.map((line: CovLine) => {
      const [conditionsCovered, conditions]: number[] = getBranchCoverage(line);

      return {
        lineNo: line.number,
        lineCovered: line.hits > 0,
        conditions,
        conditionsCovered,
      };
    });
  } catch (err) {
    console.log(
      `Unable to read coverage results file: ${COVERAGE_RESULTS_FILENAME}`
    );
    throw err;
  }
};

const getBranchCoverage = (line: CovLine): number[] => {
  const conditionCoverage = line['condition-coverage'];

  return conditionCoverage
    ? conditionCoverage
        .split(/\s/)[1]
        .split(/\//)
        .map((cond: string) => parseInt(cond.replace(/[^\d]/g, '')))
    : [0, 0];
};

const getAllLines = (coverage: CovReport) =>
  coverage.coverage.packages.flatMap(packages =>
    packages.package.flatMap(p2 =>
      p2.classes.flatMap(classes =>
        classes.class.flatMap(clazz =>
          clazz.lines.flatMap(lines => lines.line.flatMap(line => line.$))
        )
      )
    )
  );
