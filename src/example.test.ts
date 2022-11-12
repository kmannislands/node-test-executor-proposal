import { test } from './test.js';
import assert from 'node:assert';

test('Fail example', () => {
    console.log('I will now proceed to run a failing synchronous test');
    assert.equal(true, false);
});

test('Pass example', () => {
    console.log('I will now proceed to run a passing synchronous test');
    assert.equal(true, true);
});

test('Async fail', async () => {
    console.log('Console logs not interleaved with test results...');
    await assert.equal({ foo: 'bar' }, { baz: 1 });
});

test('Async pass', async () => {
    await assert.equal({ foo: 'bar' }, { foo: 'bar' });
    console.log('Console logs still not interleaved with test results...');
});
