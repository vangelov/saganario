import { expect } from 'chai';

import testPath from '../lib/testPath';

describe('testPath', () => {
  function* saga() {
    yield 'a';
  }
  it('Does not throw an exception on an empty paths', () => {
    const path = [];
    expect(() => testPath(path, saga())).to.not.throw;
  });

  it('Throws an exception when the saga finishes before the path', () => {
    const path = [
      { expectedValue: 'a' },
      { expectedValue: 'b' },
    ];

    expect(() => testPath(path, saga())).to.throw;
  });

  describe('Running paths with next expectations only', () => {
    function* saga() {
      yield 'a';
      yield 'b';
    }

    it('Does not throw an exception when correct', () => {
      const path = [
        { expectedValue: 'a' },
        { expectedValue: 'b' },
      ];

      expect(() => testPath(path, saga())).to.not.throw;
    });

    it('Throws an exception when incorrect', () => {
      const path = [
        { expectedValue: 'a' },
        { expectedValue: 'x' },
      ];

      expect(() => testPath(path, saga())).to.throw;
    });
  });

  describe('Running paths with expectations and giving', () => {
    function* saga() {
      const result = yield 'a';
      yield result + 1;
    }

    it('Does not throw an exception when correct', () => {
      const path = [
        { expectedValue: 'a', givenValue: 9 },
        { expectedValue: 10 },
      ];

      expect(() => testPath(path, saga())).to.not.throw;
    });

    it('Throws an exception when correct', () => {
      const path = [
        { expectedValue: 'a', givenValue: 9 },
        { expectedValue: 16 },
      ];

      expect(() => testPath(path, saga())).to.throw;
    });
  });

  describe('Running paths with eventual expectation', () => {
    function* saga() {
      yield 'a';
      yield 'b';
      yield 'c';
    }

    it('Does not throw an exception when the expected value is eventaully yielded', () => {
      const path = [
        { expectedValue: 'a', eventually: true},
      ];

      expect(() => testPath(path, saga())).to.not.throw;
    });

    it('Throws an exception when the generator finishes without yielding the expected value', () => {
      const path = [
        { expectedValue: 'x', eventually: true},
      ];

      expect(() => testPath(path, saga())).to.not.throw;
    });

    it('Does not hang on forever running sagas', () => {
      function* foreverSaga() {
        while (true) { // eslint-disable-line no-constant-condition
          yield 'a';
        }
      }

      const path = [
        { expectedValue: 'x', eventually: true},
      ];

      expect(() => testPath(path, foreverSaga())).to.throw;
    });
  });

  describe('Running paths with last expectation', () => {
    function* saga() {
      yield 'a';
      yield 'b';
    }

    it('Does not throw an exception when the expected value is the last', () => {
      const path = [
        { expectedValue: 'b', last: true},
      ];

      expect(() => testPath(path, saga())).to.not.throw;
    });

    it('Throws an exception when the expected value is not the last', () => {
      const path = [
        { expectedValue: 'a', last: true},
      ];

      expect(() => testPath(path, saga())).to.throw;
    });
  });
});
