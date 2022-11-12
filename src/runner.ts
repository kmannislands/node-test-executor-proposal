// import { Worker } from 'node:worker_threads';
import { fork } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import path from 'node:path';

export type ExecutionMode = 'worker' | 'fork';

interface RunOptions {
    testPaths: string[];
    executionMode: ExecutionMode;
}

function getExecutor(testPath: string, executionMode: ExecutionMode) {
    if (executionMode === 'worker') {
        return new Worker(testPath);
    }
    return fork(path.resolve(testPath), {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });
}

export async function run(options: RunOptions): Promise<number> {
    const testRuns: Promise<number>[] = [];

    for (const testPath of options.testPaths) {
        const executor = getExecutor(
            path.resolve(testPath),
            options.executionMode
        );

        executor.on('error', (errMsg) => {
            console.error(errMsg);
        });

        executor.on('message', (msg) => {
            console.log('RECEIVING SIDE', msg);
        });

        const testExitPromise = new Promise<number>((resolve) =>
            executor.on('exit', () => {
                resolve(0);
            })
        );

        testRuns.push(testExitPromise);
    }

    const testFileResults = await Promise.all(testRuns);

    console.log('Done with test run');

    return Math.max(...testFileResults);
}
