// import { Worker } from 'node:worker_threads';
import { fork } from 'node:child_process';
import path from 'node:path';

interface RunOptions {
    testPaths: string[];
}

export async function run(options: RunOptions): Promise<number> {
    const testRuns: Promise<number>[] = [];

    for (const testPath of options.testPaths) {
        const testWorker = fork(path.resolve(testPath), {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        });

        console.log('Forked worker');

        testWorker.on('error', (errMsg) => {
            console.error(errMsg);
        });

        testWorker.on('message', (msg) => {
            console.log('RECEIVING SIDE', msg);
        });

        const testExitPromise = new Promise<number>((resolve) =>
            testWorker.on('exit', () => {
                resolve(0);
            })
        );

        testRuns.push(testExitPromise);
    }

    const testFileResults = await Promise.all(testRuns);

    console.log('Done with test run');

    return Math.max(...testFileResults);
}
