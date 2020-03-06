import assert from 'assert';
import { formatDate } from '../src/formatters.mjs';

describe('formatDate', function () {
  it('should zero-pad single digit minutes', function () {
    const date = new Date('2020-01-10 10:01');
    assert.equal(formatDate(date), '10.1.2020, 10:01');
  });
  it('should zero-pad single digit hours', function () {
    const date = new Date('2020-01-10 01:10');
    assert.equal(formatDate(date), '10.1.2020, 01:10');
  });
});
