function getCallerLine(fromStackTop) {
  const err = new Error();
  const raw = err.stack.split('\n')[fromStackTop];
  const trimmed = raw.trim();
  const urlMatch = trimmed.match(/\([^\)]*\)/);

  return urlMatch[0];
}

const expect = ({ expectedValue, eventually = false, last = false }) => ({
  expectedValue,
  eventually,
  last,
  line: getCallerLine(4)
});

export const expectNext = expectedValue => expect({ expectedValue });

export const expectEventually = expectedValue => expect({ expectedValue, eventually: true });

export const expectLast = expectedValue => expect({ expectedValue, last: true });
