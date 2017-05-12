import { put, } from 'redux-saga/effects';

import { prepareTest, expectNext } from '../lib';

// Saga

function* saga() {
  yield put('ACTION1');
  yield put('ACTION2');
}

// Test:

describe('saga', () => {
  it('Does not throw in scenario', () => {
    const test = prepareTest(saga, 1, 2, [
      expectNext(put('ACTION1')),
      expectNext(put('ACITON3'))
    ]);

    try {
      test();
    } catch(error) {
      console.log('Line:', error.saganario.line); // Will print 'Line: <path-to-file.js>:19'
    }
  });
});
