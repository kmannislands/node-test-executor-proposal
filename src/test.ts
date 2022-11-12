import { getMessagingChannel, IMessageChannel } from './message-channels.js';

type TestFunction = (() => void) | (() => Promise<void>);
class Reporter {
    constructor(
        private testId: string,
        private messageChannel: IMessageChannel
    ) {}

    public testStart() {
        this.messageChannel.sendMessage({
            type: 'testStart',
            testId: this.testId,
        });
    }

    public testEnd() {
        this.messageChannel.sendMessage({
            type: 'testEnd',
            testId: this.testId,
        });
    }

    public testFail(): void {
        this.messageChannel.sendMessage({
            type: 'testFail',
            testId: this.testId,
        });
    }
}

/**
 * Very simplistic `test` function to demonstrate re-use of reporter with different messaging channels
 */
export async function test(
    testName: string,
    testFunction: TestFunction
): Promise<void> {
    const messageChannel = getMessagingChannel();
    // TODO: assign unique identifier to guard against name collision problems. This is obviously very
    // simplistic
    const testId = testName;

    const reporter = new Reporter(testId, messageChannel);

    try {
        reporter.testStart();
        await testFunction();
    } catch {
        reporter.testFail();
    } finally {
        reporter.testEnd();
    }
}
