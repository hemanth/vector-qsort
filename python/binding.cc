#include <nanobind/nanobind.h>
#include <nanobind/ndarray.h>
#include "vqsort.h"

namespace nb = nanobind;

template <typename T>
void sort_data(nb::ndarray<nb::c_contig> array, bool desc) {
  T* ptr = static_cast<T*>(array.data());
  size_t n = array.shape(0);
  vector_qsort::Sort(ptr, n, desc);
}

void sort_in_place(nb::ndarray<nb::c_contig> array, bool desc = false) {
  if (array.ndim() != 1) {
    throw nb::value_error("vector_qsort only supports 1-dimensional arrays");
  }

  using dl_code = nanobind::dlpack::dtype_code;
  auto dt = array.dtype();
  if (dt.lanes != 1) {
    throw nb::type_error("Only scalar element types are supported");
  }

  if (dt.code == static_cast<uint8_t>(dl_code::Float) && dt.bits == 32) {
    sort_data<float>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::Float) && dt.bits == 64) {
    sort_data<double>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::Int) && dt.bits == 32) {
    sort_data<int32_t>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::UInt) && dt.bits == 32) {
    sort_data<uint32_t>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::Int) && dt.bits == 64) {
    sort_data<int64_t>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::UInt) && dt.bits == 64) {
    sort_data<uint64_t>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::Int) && dt.bits == 16) {
    sort_data<int16_t>(array, desc);
  } else if (dt.code == static_cast<uint8_t>(dl_code::UInt) && dt.bits == 16) {
    sort_data<uint16_t>(array, desc);
  } else {
    throw nb::type_error("Unsupported dtype for vector_qsort (supported: float32, float64, int32, uint32, int64, uint64, int16, uint16)");
  }
}

NB_MODULE(_vector_qsort, m) {
  m.doc() = "Google Highway SIMD Vectorized QuickSort";
  m.def("sort_in_place", &sort_in_place, nb::arg("array"), nb::arg("desc") = false,
        "Sort a 1D contiguous array in-place using Google Highway SIMD.");
}
