import stacklessError from './stacklessError';

const MAX_STEPS = 100;

export default function testPath(path, generator) {
  let next = generator.next();

  for (let j = 0; j < path.length; j++) {
    const { givenValue, expectedValue, eventually, line, last } = path[j];
    const expected = JSON.stringify(expectedValue);
    let steps = 0;

    while (true) { // eslint-disable-line no-constant-condition
      if (next.done) {
        if (j !== path.lenth - 1) {
          throw stacklessError.create(expected, 'generator finished', line);
        }

        return;
      }

      const actual = JSON.stringify(next.value);
      let eventuallyEqual = false;

      if (expected !== actual && !eventually) {
        throw stacklessError.create(expected, actual, line);
      } else if (eventually) {
        eventuallyEqual = true;
      }

      if (givenValue instanceof Error) {
        next = generator.throw(givenValue);
      } else {
        next = generator.next(givenValue);
      }

      if (last && !next.done) {
        throw stacklessError.create('generator to be finished', 'generator is not finished', line);
      }

      if (!eventually || eventuallyEqual) {
        break;
      }

      steps += 1;

      if (steps > MAX_STEPS) {
        throw new Error('Too many steps ' + line);
      }
    }
  }
}
