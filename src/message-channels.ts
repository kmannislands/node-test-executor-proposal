import { isMainThread, parentPort } from 'node:worker_threads';

export interface IMessageChannel {
    // TODO type messages
    sendMessage(msg: any): void;
}

type ProcessSendMessage = Exclude<typeof process['send'], undefined>;

/**
 * Message channel to be used when sending messages to a runner that invoked 'us' as `fork` or `spawned`
 * heavyweight process.
 */
class IPCMessageChannel implements IMessageChannel {
    constructor(private sendMsgToParent: ProcessSendMessage) {}

    public sendMessage(msg: any): void {
        this.sendMsgToParent(msg);
    }
}

/**
 * Implementation to be used when test is being run as a lightweight worker thread
 */
class WorkerMessageChannel implements IMessageChannel {
    constructor() {
        if (!parentPort) {
            throw new Error(
                `Looked like a worker but theres no parent port to post results back to`
            );
        }
    }

    public sendMessage(msg: any): void {
        parentPort!.postMessage(msg);
    }
}

/**
 * Message channel to send test results to std out directly
 */
class TAPToStdOutMessageChannel {
    public sendMessage(msg: any): void {
        const serialMessage = JSON.stringify(msg);
        // TODO serialize message as TAP before write
        process.stdout.write(`${serialMessage}\n`);
    }
}

export function getMessagingChannel(): IMessageChannel {
    const isIPCExecutor = typeof process.send === 'function';
    const isWorkerExecutor = Boolean(parentPort);

    if (isIPCExecutor) {
        console.debug('Using IPC messaging');
        return new IPCMessageChannel(process.send!.bind(process));
    }

    if (isWorkerExecutor) {
        console.debug('Using Worker messaging');
        return new WorkerMessageChannel();
    }

    if (!isMainThread) {
        throw new Error(
            `Test setup error, couldn't determine a message channel`
        );
    }

    console.debug('Using direct messaging');
    return new TAPToStdOutMessageChannel();
}
