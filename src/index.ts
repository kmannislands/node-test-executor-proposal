import { run } from './runner.js';

run({ testPaths: ['./dist/example.test.js'] }).then((exitCode) => {
    process.exit(exitCode);
});
