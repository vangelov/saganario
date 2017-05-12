import { put, take } from 'redux-saga/effects';
import { expect } from 'chai';

import { prepareTest, expectNext, ifGiven } from '../lib';

// Saga

function* saga(x, y) {
  try {
    const action = yield take('SOME_ACTION');
    yield put({ type: 'OTHER_ACTION', value: x + y + action.z });
  } catch (e) {
    yield put({ type: 'ERROR' });
  }
}

// Test:

describe('saga', () => {
  it('Does not throw in scenario', () => {
    const test = prepareTest(saga, 1, 2, [
      expectNext(take('SOME_ACTION')),

      ifGiven({ type: 'SOME_ACTION', z: 3 }), [
        expectNext(put({ type: 'OTHER_ACTION', value: 6 })),
      ],
      ifGiven(new Error()), [
        expectNext(put({ type: 'ERROR' })),
      ],
    ]);

    expect(test).to.not.throw();
  });
});
