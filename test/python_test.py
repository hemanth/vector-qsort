import pytest
import numpy as np
import vector_qsort

def test_all_dtypes_and_orders():
    dtypes = [
        np.float32, np.float64,
        np.int32, np.uint32,
        np.int64, np.uint64,
        np.int16, np.uint16,
    ]
    for dt in dtypes:
        if np.issubdtype(dt, np.unsignedinteger):
            raw = np.array([42, 5, 100, 0, 999, 500], dtype=dt)
        else:
            raw = np.array([42, -5, 100, 0, 999, -500], dtype=dt)
        asc = raw.copy()
        vector_qsort.sort(asc)
        assert np.all(asc[:-1] <= asc[1:]), f"Ascending sort failed for {dt}"

        desc = raw.copy()
        vector_qsort.sort(desc, desc=True)
        assert np.all(desc[:-1] >= desc[1:]), f"Descending sort failed for {dt}"

def test_edge_cases():
    # Empty
    empty = np.array([], dtype=np.float32)
    vector_qsort.sort(empty)
    assert len(empty) == 0

    # Single element
    single = np.array([42], dtype=np.int32)
    vector_qsort.sort(single)
    assert single[0] == 42

    # All duplicates
    dupes = np.array([7, 7, 7, 7, 7], dtype=np.float64)
    vector_qsort.sort(dupes)
    assert np.array_equal(dupes, [7, 7, 7, 7, 7])

    # Already sorted
    sorted_arr = np.arange(10, dtype=np.int32)
    vector_qsort.sort(sorted_arr)
    assert np.array_equal(sorted_arr, np.arange(10))

    # Reverse sorted
    rev = np.arange(10, 0, -1, dtype=np.int32)
    vector_qsort.sort(rev)
    assert np.array_equal(rev, np.arange(1, 11))

def test_sorted_copy():
    orig = np.array([5, 3, 1, 4, 2], dtype=np.float32)
    res = vector_qsort.sorted(orig)
    assert res is not orig
    assert np.array_equal(orig, [5, 3, 1, 4, 2])
    assert np.array_equal(res, [1, 2, 3, 4, 5])

    desc = vector_qsort.sorted(orig, desc=True)
    assert np.array_equal(desc, [5, 4, 3, 2, 1])

def test_large_array():
    rng = np.random.default_rng(42)
    data = rng.standard_normal(100_000).astype(np.float32)
    expected = np.sort(data)

    vector_qsort.sort(data)
    assert np.allclose(data, expected)

def test_error_handling():
    # 2D array
    mat = np.zeros((3, 3), dtype=np.float32)
    with pytest.raises(ValueError, match="1-dimensional"):
        vector_qsort.sort(mat)

    # Unsupported dtype
    unsupported = np.array(["a", "b", "c"])
    with pytest.raises(TypeError):
        vector_qsort.sort(unsupported)
