# Test runner messaging channel samples

Simplistic example implementation of different messaging channels for test executors, inspired by conversation in [this PR
to node.js core](https://github.com/nodejs/node/pull/43525#issuecomment-1311628864).

The intent of this repo is to enable discussion on different approaches to communication between test processes
('executors') and their runner process ('head') that:

- Do not interleave test stdout with test reporting
- Are still runnable directly with node

This repo contains:

- a single very simplistic test executor implementation called `test` with a similar signature to the
  `node:test` function by the same name
- a simplistic `run` function also with a similar signature to the `node:test` function by the same name
- a test suite under `src/example.test.ts` used to demonstrate the aforementioned machinery

The variance on the executor-side is constrained to different implementations of a very simple
`IMessageChannel` interface. When running a test, the executor checks its context to determine if it is being
executed as a worker, a forked process or directly and creates a message channel class accordingly. The
message channel classes have minimal logic of their own and are easily substitutable.

The reporter implementation is the same regardless of the execution context. It contains a verifying
`IMessageChannel` implementation.

On the runner side, the only difference between `worker` and `fork` execution modes is whether a light-weight
`Worker` process is created or a heavyweight `node` process is forked. This is varied using a command line argument.

## Running the examples

Setup

```sh
npm i
npm run compile # build typescript
```

Now the interesting part, there are three ways execute the example test suite:

### Direct

This mode demonstrates that tests can be run directly while writing reporter messages to stdout, interleaved
with test messages written to stdout

```sh
node ./dist/example.test.js $ or npm run test:direct
```

### Worker

This mode uses lightweight worker thread processes. It uses a typical worker postMessage scheme as the
messaging channel. It could be adapted to support transferred memory.

This mode of execution would likely prove faster for suites with many lightweight/fast tests.

```sh
node ./dist/index.js --executionMode worker
```

### Fork

This mode forks a new process. It is most similar to the existing setup in `node.js` core at the time of
writing (`v19.0.1`).
However, instead of relying on parsing TAP from interleaves stdout, it uses an IPC channel to test result
messages from the test executors back to the test runner head process.

```sh
node ./dist/index.js --executionMode fork
```

## Future experiments

This is currently missing a `spawn` implementation. It should be fairly trivial to add since its very similar
mechanically to `fork`.

It would also be interesting to add a `cluster` implementation.
