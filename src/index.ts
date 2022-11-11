import { run } from './runner.js';

run({ testPaths: ['./dist/test.js'] }).then((exitCode) => {
    process.exit(exitCode);
})