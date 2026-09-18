# vector-qsort

Vectorized quicksort for TypedArrays and NumPy arrays using Google Highway SIMD.

```bash
npm install vector-qsort
# or
pip install vector-qsort
```

## Quick start (JavaScript)

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

## Quick start (Python)

```python
import numpy as np
import vector_qsort

data = np.array([3.14, -1.5, 42.0, 0.0, -100.5, 2.71], dtype=np.float32)

# In-place SIMD sort
vector_qsort.sort(data)

# Descending
vector_qsort.sort(data, desc=True)

# Non-mutating copy
sorted_data = vector_qsort.sorted(data)
```

`sort()` sorts 1D contiguous arrays in place with zero copies. `sorted()` returns a sorted copy. Supports `float32`, `float64`, `int32`, `uint32`, `int64`, `uint64`, `int16`, and `uint16`.

## Off-thread sorting (Node.js)

```js
import vsort from 'vector-qsort';

const big = new Float32Array(10_000_000);
// fill with data...

// Runs on libuv worker thread — zero main thread blocking
await vsort.async(big);
```

Sorts large buffers in background worker threads without interrupting the Node.js event loop.

## Benchmarks

Science-backed benchmarks measured on Apple Silicon (ARM NEON) using high-resolution monotonic clocks over 50 iterations with pre-allocated samples.

### Node.js (vs V8 `TypedArray.prototype.sort()`)

```bash
cd node && npm run bench
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

### Python (vs NumPy in-place `np.sort()`)

```bash
cd python && python bench/bench_sort.py
```

| Dtype | Size | Distribution | NumPy (median) | vector-qsort | Speedup |
|---|---|---|---|---|---|
| `float32` | 100,000 | Random | 1.14 ms | **0.73 ms** | **1.57x** |
| `float32` | 5,000,000 | Random | 81.97 ms | **50.39 ms** | **1.63x** |
| `float64` | 100,000 | Random | 2.25 ms | **1.33 ms** | **1.70x** |
| `float64` | 5,000,000 | Plateau | 39.40 ms | **18.04 ms** | **2.18x** |

## Note on scalar sorts

Modern scalar sorts like `driftsort` and `ipnsort` excel at generic types and presorted run-detection. `vector-qsort` is designed specifically for raw numeric throughput on contiguous buffers by saturating SIMD vector lanes.

## Playground

Interactive SIMD visualizer & benchmark: [hemanth.github.io/vector-qsort](https://hemanth.github.io/vector-qsort/)

## License

MIT © [Hemanth.HM](https://h3manth.com)
