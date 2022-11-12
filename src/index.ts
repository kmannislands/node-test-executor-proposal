import { ExecutionMode, run } from './runner.js';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
    options: {
        executionMode: {
            type: 'string',
        },
    },
});

function validateExecutionMode(
    maybeExecutionMode?: string
): asserts maybeExecutionMode is ExecutionMode {
    if (!maybeExecutionMode) {
        throw new Error(
            'Unspecifed execution mode. Please pass `--executionMode` with a value of `worker` or `fork`'
        );
    }

    if (!['worker', 'fork'].includes(maybeExecutionMode)) {
        throw new Error(`Unhandled execution mode option ${maybeExecutionMode}`);
    }
}

validateExecutionMode(values.executionMode);

run({
    testPaths: ['./dist/example.test.js'],
    executionMode: values.executionMode,
}).then((exitCode) => {
    process.exit(exitCode);
});
