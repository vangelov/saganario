import { expect } from 'chai';

import collectPaths from '../lib/collectPaths';

describe('collectPaths', () => {
  it('Returns an empty array when there are no paths', () => {
    const scenario = [];
    const actualPaths = [];
    collectPaths(scenario, actualPaths);

    expect(actualPaths).to.deep.equal([]);
  });

  it('Returns a single path when there are no branches', () => {
    const scenario = [
      { expectedValue: 'a' },
      { expectedValue: 'b' },
      { expectedValue: 'c' },
    ];

    const actualPaths = [];
    collectPaths(scenario, actualPaths);

    expect(actualPaths).to.have.length(1);
    expect(actualPaths[0]).to.deep.equal(scenario);
  });

  it('Supports branching', () => {
    const scenario = [
      { expectedValue: 'a' },
      { givenValue: 'x' }, [
        { expectedValue: 'b' },
        { givenValue: 'z' }, [
          { expectedValue: 'd' },
        ],
      ],
      { givenValue: 'y' }, [
        { expectedValue: 'c' },
      ],
    ];

    const actualPaths = [];
    collectPaths(scenario, actualPaths);

    const expectedPaths = [
      [
        { expectedValue: 'a', givenValue: 'x' },
        { expectedValue: 'b', givenValue: 'z' },
        { expectedValue: 'd' },
      ],
      [
        { expectedValue: 'a', givenValue: 'y' },
        { expectedValue: 'c' },
      ],
    ];

    expect(actualPaths).to.deep.equal(expectedPaths);
  });
});
