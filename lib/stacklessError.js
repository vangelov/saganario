exports.create = (expected, actual, line) => {
  const message = `[expected]: ${expected}; [actual]: ${actual} ${line}`;
  const err = new Error(message);

  err.saganario = {
    line,
    expected,
    actual,
  };

  err.stack = message;

  return err;
};
