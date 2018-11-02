const { PerformanceObserver, performance } = require('perf_hooks');

const M = {
  'sha3@master': require('sha3'),
  'crypto-js': require('crypto-js'),
  keccak: require('keccak'),
  'js-sha3': require('js-sha3'),
  'sha3@next': require('sha3-next')
};

const benchmarks = {
  'Keccak-256': {
    'sha3@master': (input) => M['sha3@master'].SHA3Hash(256).update(input).digest('hex'),
    'sha3@next': (input) => M['sha3@next'].Keccak(256).update(input).digest('hex'),
    'crypto-js': (input) => M['crypto-js'].SHA3(M['crypto-js'].enc.Hex.parse(input.toString('hex')), { outputLength: 256 }).toString(),
    'js-sha3': (input) => M['js-sha3'].keccak_256(input),
    'keccak': (input) => M['keccak']('keccak256').update(input).digest('hex')
  },
  'SHA3-256': {
    'js-sha3': (input) => M['js-sha3'].sha3_256(input),
    'sha3@next': (input) => M['sha3@next'].SHA3(256).update(input).digest('hex')
  }
};

const input = Buffer.alloc(4096);
input.fill(0x42);

const performanceObserver = new PerformanceObserver((items) => {
  const [{ duration, name }] = items.getEntries();
  console.log(JSON.stringify({
    ...JSON.parse(name),
    duration: duration
  }, null, 2));
  performance.clearMarks();
});

performanceObserver.observe({ entryTypes: ['measure'] });

const iterations = 1000;

for (const algorithm of Object.keys(benchmarks)) {
  const implementations = benchmarks[algorithm];
  for (const implementation of Object.keys(implementations)) {
    const benchmark = implementations[implementation];
    const key = JSON.stringify({ algorithm, implementation, inputLength: input.length, iterations });
    performance.mark(`${key}:start`);
    for (let i = 0; i < iterations; i++) {
      benchmark(input);
    }
    performance.mark(`${key}:end`);
    performance.measure(key, `${key}:start`, `${key}:end`);
  }
}
