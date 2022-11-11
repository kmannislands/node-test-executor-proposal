import { Worker } from 'node:worker_threads';

interface RunOptions {
  testPaths: string[];
}

export async function run(options: RunOptions): Promise<number> {
  const testRuns: Promise<number>[] = [];
  for (const testPath of options.testPaths) {
    const testWorker = new Worker(testPath);

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

  return Math.max(...testFileResults);
}
