#ifndef VECTOR_QSORT_CORE_H_
#define VECTOR_QSORT_CORE_H_

#include <cstddef>
#include <cstdint>
#include <algorithm>
#include <functional>

#include "hwy/base.h"
#include "hwy/contrib/sort/vqsort.h"

namespace vector_qsort {

template <typename T>
inline void Sort(T* data, size_t n, bool desc = false) {
  if (n <= 1) return;
  if (desc) {
    hwy::VQSort(data, n, hwy::SortDescending());
  } else {
    hwy::VQSort(data, n, hwy::SortAscending());
  }
}

// Specialization for double in case VQSortHaveFloat64 is not supported on rare targets
template <>
inline void Sort<double>(double* data, size_t n, bool desc) {
  if (n <= 1) return;
  if (hwy::VQSortHaveFloat64()) {
    if (desc) {
      hwy::VQSort(data, n, hwy::SortDescending());
    } else {
      hwy::VQSort(data, n, hwy::SortAscending());
    }
  } else {
    if (desc) {
      std::sort(data, data + n, std::greater<double>());
    } else {
      std::sort(data, data + n);
    }
  }
}

}  // namespace vector_qsort

#endif  // VECTOR_QSORT_CORE_H_
