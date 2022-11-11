import assert from 'node:assert';
import { isMainThread, parentPort } from 'node:worker_threads';

type TestFunction = (() => void) | (() => Promise<void>);

interface IReporter {
    testStart(): void;
    testEnd(): void;
    testFail(): void;
}

class DirectReporter implements IReporter {
    constructor(private testId: string) {}

    public testStart(): void {
        console.time(this.testId);
    }

    public testEnd(): void {
        console.timeEnd(this.testId);
    }

    public testFail(): void {
        console.log(`Oh mama mia no, test "${this.testId}" failed :(`);
    }
}

class RunContextReporter implements IReporter {
    constructor(private testId: string) {}

    private sendMessage(msg: any): void {
        if (!parentPort) {
            throw new Error(
                `Looked like a worker but theres no parent port to post results back to`
            );
        }

        parentPort.postMessage(msg);
    }

    public testStart() {
        this.sendMessage({ type: 'testStart', testId: this.testId });
    }

    public testEnd() {
        this.sendMessage({ type: 'testEnd', testId: this.testId });
    }

    public testFail(): void {
        this.sendMessage({ type: 'testFail', testId: this.testId });
    }
}

export async function test(
    testName: string,
    testFunction: TestFunction
): Promise<void> {
    // TODO: assign unique identifier to guard against name collision problems. This is obviously very
    // simplistic
    const testId = testName;

    const reporter: IReporter = isMainThread
        ? new DirectReporter(testId)
        : new RunContextReporter(testId);

    // Exec test:
    try {
        reporter.testStart();
        await testFunction();
    } catch {
        reporter.testFail();
    } finally {
        reporter.testEnd();
    }
}

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
