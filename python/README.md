# vector-qsort

Vectorized quicksort for NumPy arrays using Google Highway SIMD.

```bash
pip install vector-qsort
```

## Quick start

```python
import numpy as np
import vector_qsort

data = np.array([3.14, -1.5, 42.0, 0.0, -100.5, 2.71], dtype=np.float32)

# In-place SIMD sort
vector_qsort.sort(data)
# array([-100.5, -1.5, 0.0, 2.71, 3.14, 42.0], dtype=float32)

# Descending
vector_qsort.sort(data, desc=True)

# Non-mutating copy
sorted_data = vector_qsort.sorted(data)
```

`sort()` sorts 1D contiguous arrays in place with zero copies. `sorted()` returns a sorted copy. Supports `float32`, `float64`, `int32`, `uint32`, `int64`, `uint64`, `int16`, and `uint16`.

## Benchmarks

Measured on Apple Silicon (ARM NEON) vs NumPy's native in-place `np.sort()`:

```bash
python bench/bench_sort.py
```

| Dtype | Size | Distribution | NumPy (median) | vector-qsort | Speedup |
|---|---|---|---|---|---|
| `float32` | 100,000 | Random | 1.14 ms | **0.73 ms** | **1.57x** |
| `float32` | 5,000,000 | Random | 81.97 ms | **50.39 ms** | **1.63x** |
| `float64` | 100,000 | Random | 2.25 ms | **1.33 ms** | **1.70x** |
| `float64` | 5,000,000 | Plateau | 39.40 ms | **18.04 ms** | **2.18x** |

## Note on scalar sorts

Modern scalar sorts like `driftsort` and `ipnsort` excel at generic types and presorted run-detection. `vector-qsort` is designed specifically for raw numeric throughput on contiguous buffers by saturating SIMD vector lanes.

## License

MIT © [Hemanth.HM](https://h3manth.com)
