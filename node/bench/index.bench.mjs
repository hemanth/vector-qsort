import vsort from '../index.js';

// Science-backed benchmarking harness
function generateData(type, size, distribution) {
  let arr;
  switch (type) {
    case 'Float32Array': arr = new Float32Array(size); break;
    case 'Float64Array': arr = new Float64Array(size); break;
    case 'Int32Array': arr = new Int32Array(size); break;
    case 'BigInt64Array': arr = new BigInt64Array(size); break;
    default: throw new Error(`Unknown type ${type}`);
  }

  const isBigInt = type === 'BigInt64Array';

  if (distribution === 'random') {
    for (let i = 0; i < size; i++) {
      const v = Math.random() * 2000000 - 1000000;
      arr[i] = isBigInt ? BigInt(Math.floor(v)) : v;
    }
  } else if (distribution === 'sorted') {
    for (let i = 0; i < size; i++) {
      arr[i] = isBigInt ? BigInt(i) : i;
    }
  } else if (distribution === 'reverse') {
    for (let i = 0; i < size; i++) {
      arr[i] = isBigInt ? BigInt(size - i) : (size - i);
    }
  } else if (distribution === 'plateau') {
    // 10 distinct values
    for (let i = 0; i < size; i++) {
      const v = (i % 10) * 100;
      arr[i] = isBigInt ? BigInt(v) : v;
    }
  }
  return arr;
}

function runBenchmark(fn, masterArray, iterations, warmup = 5) {
  // Pre-allocate copies so cloning overhead is excluded from timing
  const total = warmup + iterations;
  const copies = new Array(total);
  for (let i = 0; i < total; i++) {
    copies[i] = masterArray.slice();
  }

  // Warmup
  for (let i = 0; i < warmup; i++) {
    fn(copies[i]);
  }

  // Measure
  const times = [];
  for (let i = warmup; i < total; i++) {
    const target = copies[i];
    const start = process.hrtime.bigint();
    fn(target);
    const end = process.hrtime.bigint();
    times.push(Number(end - start) / 1e6); // ms
  }

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const min = times[0];
  const p95 = times[Math.floor(times.length * 0.95)];
  return { median, min, p95 };
}

async function main() {
  console.log('='.repeat(80));
  console.log('  vector-qsort vs V8 TypedArray.prototype.sort() Benchmark');
  console.log(`  Node.js: ${process.version} | Arch: ${process.arch} | Platform: ${process.platform}`);
  console.log('='.repeat(80));
  console.log('');

  const sizes = [1_000, 10_000, 100_000, 1_000_000, 5_000_000];
  const types = ['Float32Array', 'Int32Array', 'Float64Array'];
  const distributions = ['random', 'sorted', 'reverse', 'plateau'];

  console.log(
    '| Type'.padEnd(14) +
    '| Size'.padEnd(12) +
    '| Distribution'.padEnd(15) +
    '| V8 (median)'.padEnd(16) +
    '| vqsort (median)'.padEnd(18) +
    '| Speedup'.padEnd(11) +
    '| M elem/s |'
  );
  console.log('|' + '-'.repeat(13) + '|' + '-'.repeat(11) + '|' + '-'.repeat(14) + '|' + '-'.repeat(15) + '|' + '-'.repeat(17) + '|' + '-'.repeat(10) + '|' + '-'.repeat(10) + '|');

  for (const type of types) {
    for (const size of sizes) {
      // Pick representative distributions to keep benchmark runtime reasonable
      const curDists = size >= 1_000_000 ? ['random', 'plateau'] : distributions;

      for (const dist of curDists) {
        const master = generateData(type, size, dist);
        const iters = size >= 1_000_000 ? 10 : (size >= 100_000 ? 25 : 50);

        const v8Stats = runBenchmark((arr) => arr.sort(), master, iters);
        const vqStats = runBenchmark((arr) => vsort(arr), master, iters);

        const speedup = v8Stats.median / vqStats.median;
        const throughput = (size / 1e6) / (vqStats.median / 1000);

        const v8Str = `${v8Stats.median.toFixed(3)} ms`;
        const vqStr = `${vqStats.median.toFixed(3)} ms`;
        const speedupStr = `${speedup.toFixed(2)}x`;
        const mpsStr = `${throughput.toFixed(1)} M/s`;

        console.log(
          `| ${type}`.padEnd(14) +
          `| ${size.toLocaleString()}`.padEnd(12) +
          `| ${dist}`.padEnd(15) +
          `| ${v8Str}`.padEnd(16) +
          `| ${vqStr}`.padEnd(18) +
          `| ${speedupStr}`.padEnd(11) +
          `| ${mpsStr}`.padEnd(10) + ' |'
        );
      }
    }
  }

  console.log('');
  console.log('Done.');
}

main().catch(console.error);
