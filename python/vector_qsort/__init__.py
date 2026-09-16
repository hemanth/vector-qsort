"""
vector-qsort: Vectorized quicksort for NumPy arrays using Google Highway SIMD.
"""
from typing import Any
import numpy as np

try:
    from ._vector_qsort import sort_in_place
except ImportError:
    try:
        from _vector_qsort import sort_in_place
    except ImportError as exc:
        raise ImportError(
            "Could not load native _vector_qsort extension. Run `pip install -e .`"
        ) from exc

def sort(arr: Any, desc: bool = False) -> Any:
    """
    Sort a 1D contiguous array in-place using Google Highway SIMD.
    """
    if isinstance(arr, np.ndarray):
        if not arr.flags.c_contiguous:
            raise ValueError("Array must be C-contiguous. Use np.ascontiguousarray() if needed.")
    sort_in_place(arr, desc=desc)
    return arr

def sorted(arr: Any, desc: bool = False) -> Any:
    """
    Return a sorted copy of the array without mutating the original.
    """
    if isinstance(arr, np.ndarray):
        copy = arr.copy()
        sort_in_place(copy, desc=desc)
        return copy
    raise TypeError(f"sorted() expects numpy.ndarray, got {type(arr).__name__}")

__all__ = ["sort", "sorted"]
