import time
import numpy as np
import vector_qsort

def generate_data(dtype, size, distribution):
    rng = np.random.default_rng(42)
    if distribution == "random":
        if np.issubdtype(dtype, np.floating):
            return rng.standard_normal(size).astype(dtype)
        else:
            return rng.integers(-1_000_000, 1_000_000, size=size, dtype=dtype)
    elif distribution == "sorted":
        return np.arange(size, dtype=dtype)
    elif distribution == "reverse":
        return np.arange(size, 0, -1, dtype=dtype)
    elif distribution == "plateau":
        return (np.arange(size) % 10).astype(dtype)
    raise ValueError(f"Unknown distribution: {distribution}")

def run_benchmark(sort_fn, master_array, iterations, warmup=5):
    total = warmup + iterations
    copies = [master_array.copy() for _ in range(total)]

    # Warmup
    for i in range(warmup):
        sort_fn(copies[i])

    # Measure
    times = []
    for i in range(warmup, total):
        target = copies[i]
        t0 = time.perf_counter_ns()
        sort_fn(target)
        t1 = time.perf_counter_ns()
        times.append((t1 - t0) / 1e6)  # ms

    times.sort()
    median = times[len(times) // 2]
    min_time = times[0]
    p95 = times[int(len(times) * 0.95)]
    return median, min_time, p95

def main():
    print("=" * 80)
    print("  vector-qsort vs NumPy np.sort() In-Place Benchmark")
    print(f"  NumPy: {np.__version__} | Python: 3.14 | Platform: Apple Silicon (NEON)")
    print("=" * 80)
    print("")

    sizes = [1_000, 10_000, 100_000, 1_000_000, 5_000_000]
    dtypes = [np.float32, np.int32, np.float64]
    distributions = ["random", "plateau"]

    header = (
        f"| {'Dtype':<12}"
        f"| {'Size':<12}"
        f"| {'Distribution':<14}"
        f"| {'NumPy (median)':<16}"
        f"| {'vqsort (median)':<17}"
        f"| {'Speedup':<10}"
        f"| {'M elem/s':<10} |"
    )
    print(header)
    print("|" + "-" * 13 + "|" + "-" * 12 + "|" + "-" * 15 + "|" + "-" * 17 + "|" + "-" * 18 + "|" + "-" * 11 + "|" + "-" * 11 + "|")

    for dt in dtypes:
        dt_name = dt.__name__
        for size in sizes:
            for dist in distributions:
                master = generate_data(dt, size, dist)
                iters = 10 if size >= 1_000_000 else (25 if size >= 100_000 else 50)

                # arr.sort() is NumPy's in-place sort
                np_med, _, _ = run_benchmark(lambda a: a.sort(), master, iters)
                vq_med, _, _ = run_benchmark(lambda a: vector_qsort.sort(a), master, iters)

                speedup = np_med / vq_med
                throughput = (size / 1e6) / (vq_med / 1000)

                print(
                    f"| {dt_name:<12}"
                    f"| {size:<12,}"
                    f"| {dist:<14}"
                    f"| {np_med:>8.3f} ms     "
                    f"| {vq_med:>8.3f} ms      "
                    f"| {speedup:>6.2f}x   "
                    f"| {throughput:>7.1f} M/s |"
                )

    print("")
    print("Done.")

if __name__ == "__main__":
    main()
