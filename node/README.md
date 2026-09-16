# vector-qsort

Vectorized quicksort for TypedArrays using Google Highway SIMD.

```bash
npm install vector-qsort
```

## Quick start

```js
import vsort from 'vector-qsort';

const f32 = new Float32Array([3.14, -1.5, 42.0, 0, -100.5, 2.71]);

// In-place SIMD sort
vsort(f32);
// Float32Array [-100.5, -1.5, 0, 2.71, 3.14, 42]

// Descending
vsort(f32, { desc: true });

// Non-mutating copy
const sorted = vsort.sorted(f32);
```

`vsort()` sorts a TypedArray in place using SIMD. `vsort.sorted()` returns a sorted copy. `vsort.async()` sorts off the main thread. That's the whole API.

Supports `Float32Array`, `Float64Array`, `Int32Array`, `Uint32Array`, `BigInt64Array`, `BigUint64Array`, `Int16Array`, and `Uint16Array`.

## Off-thread sorting

```js
import vsort from 'vector-qsort';

const big = new Float32Array(10_000_000);
// fill with data...

// Runs on libuv worker thread — zero main thread blocking
await vsort.async(big);
```

Sorts large buffers in background worker threads without interrupting the Node.js event loop.

## Benchmarks

Measured on Apple Silicon (ARM NEON) vs V8's native `TypedArray.prototype.sort()` over 50 iterations:

```bash
npm run bench
```

| Type | Size | Distribution | V8 (median) | vector-qsort | Speedup |
|---|---|---|---|---|---|
| `Float32Array` | 100,000 | Random | 5.18 ms | **0.72 ms** | **7.12x** |
| `Float32Array` | 1,000,000 | Random | 63.90 ms | **9.31 ms** | **6.86x** |
| `Float32Array` | 5,000,000 | Random | 359.60 ms | **50.66 ms** | **7.10x** |
| `Float64Array` | 100,000 | Random | 5.38 ms | **1.41 ms** | **3.82x** |
| `Float64Array` | 1,000,000 | Random | 65.56 ms | **17.19 ms** | **3.81x** |
| `Float64Array` | 5,000,000 | Random | 360.88 ms | **95.42 ms** | **3.78x** |
| `Int32Array` | 1,000,000 | Random | 15.42 ms | **8.73 ms** | **1.77x** |

## Note on scalar sorts

Modern scalar sorts like `driftsort` and `ipnsort` excel at generic types and presorted run-detection. `vector-qsort` is designed specifically for raw numeric throughput on contiguous buffers by saturating SIMD vector lanes.

## License

MIT © [Hemanth.HM](https://h3manth.com)
