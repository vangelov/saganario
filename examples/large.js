import { expect } from 'chai';
import { call, put } from 'redux-saga/effects';

import { prepareTest, expectNext, ifGiven } from '../lib';

// Saga (from https://github.com/antoinejaussoin/redux-saga-testing#testing-a-complex-saga):

const splitApi = () => {};
const someActionSuccess = payload => ({ type: 'SOME_ACTION_SUCCESS', payload });
const someActionEmpty = () => ({ type: 'SOME_ACTION_EMPTY' });
const someActionError = error => ({ type: 'SOME_ACTION_ERROR', payload: error });

function* mySaga(input) {
  try {
      // We try to call the API, with the given input
      // We expect this API takes a string and returns an array of all the words, split by comma
    const someData = yield call(splitApi, input);

    // From the data we get from the API, we filter out the words 'foo' and 'bar'
    const transformedData = someData.filter(w => ['foo', 'bar'].indexOf(w) === -1);

    // If the resulting array is empty, we call the empty action, otherwise we call the success action
    if (transformedData.length === 0) {
      yield put(someActionEmpty());
    } else {
      yield put(someActionSuccess(transformedData));
    }
  } catch (e) {
    // If we got an exception along the way, we call the error action with the error message
    yield put(someActionError(e.message));
  }
}

// Two tests with different arguments:

describe('mySaga', () => {
  it('Does not throw exception in scenario 1', () => {
    const test = prepareTest(mySaga, 'hello,foo,bar,world', [
      expectNext(call(splitApi, 'hello,foo,bar,world')),

      ifGiven(['hello', 'foo', 'bar', 'world']), [
        expectNext(put(someActionSuccess(['hello', 'world']))),
      ],
      ifGiven(new Error('Something went wrong')), [
        expectNext(put(someActionError('Something went wrong'))),
      ]
    ]);

    expect(test).not.to.throw();
  });

  it('Does not throw exception in scenario 2', () => {
    const test = prepareTest(mySaga, 'foo,bar', [
      expectNext(call(splitApi, 'foo,bar')),
      ifGiven(['foo', 'bar']), [
        expectNext(put(someActionEmpty())),
      ]
    ]);

    expect(test).not.to.throw();
  });
});
