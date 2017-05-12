import { call, put, fork, take } from 'redux-saga/effects';
import { expect } from 'chai';

import { prepareTest, expectNext, ifGiven, expectEventually } from '../lib';

// Saga (from https://github.com/jfairbank/redux-saga-test-plan/tree/master/docs/unit-testing):

function identity(value) {
  return value;
}

function* otherSaga() {}

function* mainSaga(x, y, z) {
  try {
    const action = yield take('HELLO');
    yield put({ type: 'ADD', payload: x + y });
    yield call(identity, action);
    yield fork(otherSaga, z);
  } catch (e) {
    yield put({ type: 'ERROR', payload: e });
  }
}

const action = { type: 'TEST' };

const error = new Error('My Error');

// Test:

describe('mainSaga', () => {
  it('Does not throw in scenario', () => {
    const test = prepareTest(mainSaga, 4, 2, 20, [
      expectNext(take('HELLO')),

      ifGiven(action), [
        expectEventually(fork(otherSaga, 20)),
      ],
      ifGiven(error), [
        expectNext(put({ type: 'ERROR', payload: error })),
      ],
    ]);

    expect(test).to.not.throw();
  });
});
