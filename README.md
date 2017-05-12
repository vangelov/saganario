# saganario

When I first began writing unit tests for sagas using a standard framework such as `mocha`, I noticed
that there was too much boilerplate that had be written and it was tedious to test different paths the code could take. I looked into some of the libraries created specifically for testing sagas but they didn't seem much better.

`Saganario` tries to provide a compact and powerful way to unit test redux sagas. It can be used with any testing framework.

## Example

Let's say we have the following saga:

```javascript
function* saga(x, y) {
  try {
    const action = yield take('SOME_ACTION');
    yield put({ type: 'OTHER_ACTION', value: x + y + action.z });
  } catch (e) {
    yield put({ type: 'ERROR' });
  }
}
```

Here's a sample test for it:

```javascript
import { prepareTest, expectNext, ifGiven } from 'saganario';

const test = prepareTest(saga, 1, 2, [
  expectNext(take('SOME_ACTION')),

  ifGiven({ type: 'SOME_ACTION', value: 2 }), [
    expectNext(put({ type: 'OTHER_ACTION', value: 3 })),
  ],
  ifGiven(new Error()), [
    expectNext(put({ type: 'ERROR' })),
  ],
]);
```

The code above tests two different paths depending on whether there's an error.
`Saganario` tests are made of nested arrays and look a bit like Lisp code.

## Details

The tests can be recursively defined as follows:

```
<saganarioTest> ::= [
  expect1,
  expect2,
  ...
  expectN,

  ifGiven(value1), <saganarioTest>,
  ifGiven(value2), <saganarioTest>,
  ...
  ifGiven(value3), <saganarioTest>
]
```

Essentially they represent a tree in which each node is a sequence of `expect` functions and each child node is another sequence of `expect` functions to which we transition by giving the argument of the `ifGiven` function to the saga. `Saganario` will run and check each path in the tree from the root to any of the leaves.

### Running tests

The `prepareTest` function you saw earlier creates a function that you can execute and in case of an unmet expectation, it throws an error. `prepareTest` takes the saga as the first argument, then any arguments the saga itself takes and then the test scenario.

For example you can use `saganario` with `mocha` like so:

```javascript
describe('saga', () => {
  it('Does not throw in this scenario', () => {
    const test = prepareTest(saga, 1, 2, [
      ...
    ]);

    expect(test).to.not.throw();
  });
});
```

### Errors

Whenever an expected value is not met `saganario` throws an error whose message contains: the expected value, the actual value and also the line in your test which caused the error.

Example saga:

```javascript
function *saga() {
  yield 'value1';
  yield 'value2';
}
```

Test:

```javascript
1. const test = prepareTest(saga, [
2.   expectNext('value1');
3.   expectNext('otherValue'); // on this line the expectation is not met
4. ]);
```

An error will be thrown with the following message `[expected]: value1; [actual]: otherValue (<path-to-your-file.js>:3)`.

If you need to use the information from the message you can catch the error to get it in this way:

```javascript
try {
  test()
} catch(error) {
  const { expected, actual, line } = error.saganario;
  // ...
}
```

### Expecting values

There are several expectation types that you can use:

#### `expectNext`

This is the most common type of expectation. It just checks if the next yielded value from the saga is what it's expected to be. You already saw examples of how to use it.

#### `expectEventually`

Often you don't care for all the values a saga yields, but only that it eventually emits a certain value. Take the following saga as an example:

```javascript
function *saga() {
  const value = yield 'start';

  if (value > 0) {
    yield 'step1';
    yield 'step2';
    yield 'step3';
    yield 'end';
  }

  yield 'error';
}
```
You only care that it yields `'start'` at the beginning and that at some point later it emits `'result'`. You can write the following test:

```javascript
const test = prepareTest(saga, [
  expectNext('start');

  ifGiven(100), [
    expectEventually('end'),
  ],
  ifGiven(-1), [
    expectNext('error'),
  ]
]);
```

*Note: If the expected value is not reached after 100 iterations of the generator, an error will be thrown.*

#### `expectEnd`

This type of expectation is used when you want check that after the expected value is emitted the generator ends.

Example saga:

```javascript
function *saga() {
  yield 'value1';
  yield 'value2';
}
```

Test:

```javascript
const test = prepareTest(saga, [
  expectNext('start');
  expectEnd('value2');
]);
```

An error will be thrown if the generator is not done when `expectEnd` is checked.

### Giving values

The only function you use for this is `ifGiven`. If the argument you set is not an instance of `Error` the value is given to the generator by using `generator.next(<value>)`. Otherwise it's thrown as an exception in the generator using `generator.throw(<value>)`.

## Installation

`npm install --save saganario`

## Example

In `/examples` folder you will find several tests for sagas of different complexities. You can run them with: `npm run examples`.

## Test

To run the tests execute: `npm test`.
