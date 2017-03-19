const MAX_STEPS = 100;

function createStacklessError(message) {
  const err = new Error(message);
  err.stack = message;

  return err;
}

export default function testPath(path, generator) {
  let next = generator.next();

  for (let j = 0; j < path.length; j++) {
    const { givenValue, expectedValue, eventually, line, last } = path[j];
    const expected = JSON.stringify(expectedValue);
    let steps = 0;

    while (true) { // eslint-disable-line no-constant-condition
      if (next.done) {
        if (j !== path.lenth - 1) {
          throw createStacklessError(`${line} | Expected: ${expected} | Actual: generator finished.`);
        }

        return;
      }

      const actual = JSON.stringify(next.value);
      let eventuallyEqual = false;

      if (expected !== actual && !eventually) {
        throw createStacklessError(`${line} | Expected: ${expected} | Actual: ${actual}`);
      } else if (eventually) {
        eventuallyEqual = true;
      }

      if (givenValue instanceof Error) {
        next = generator.throw(givenValue);
      } else {
        next = generator.next(givenValue);
      }

      if (last && !next.done) {
        throw new Error('fuck');
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
