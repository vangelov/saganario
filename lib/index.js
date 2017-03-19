import collectPaths from './collectPaths';
import testPath from './testPath';

export { expectNext, expectLast, expectEventually } from './expects';

export const ifGiven = givenValue => ({ givenValue });

export function prepareTest(saga, ...rest) {
  return () => {
    const scenario = rest[rest.length - 1];
    const sagaArgs = rest.slice(0, rest.length - 1);
    const paths = [];

    collectPaths(scenario, paths);

    for (let i = 0; i < paths.length; i++) {
      const generator = saga(...sagaArgs);
      testPath(paths[i], generator);
    }
  };
}
