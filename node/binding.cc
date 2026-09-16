#include <napi.h>
#include "vqsort.h"

namespace {

inline bool DispatchSort(napi_typedarray_type type, void* data, size_t length, bool desc) {
  switch (type) {
    case napi_float32_array:
      vector_qsort::Sort(static_cast<float*>(data), length, desc);
      return true;
    case napi_float64_array:
      vector_qsort::Sort(static_cast<double*>(data), length, desc);
      return true;
    case napi_int32_array:
      vector_qsort::Sort(static_cast<int32_t*>(data), length, desc);
      return true;
    case napi_uint32_array:
      vector_qsort::Sort(static_cast<uint32_t*>(data), length, desc);
      return true;
    case napi_bigint64_array:
      vector_qsort::Sort(static_cast<int64_t*>(data), length, desc);
      return true;
    case napi_biguint64_array:
      vector_qsort::Sort(static_cast<uint64_t*>(data), length, desc);
      return true;
    case napi_int16_array:
      vector_qsort::Sort(static_cast<int16_t*>(data), length, desc);
      return true;
    case napi_uint16_array:
      vector_qsort::Sort(static_cast<uint16_t*>(data), length, desc);
      return true;
    default:
      return false;
  }
}

class SortWorker : public Napi::AsyncWorker {
 public:
  SortWorker(Napi::Env env, Napi::TypedArray typed_array, napi_typedarray_type type,
             void* data, size_t length, bool desc, Napi::Promise::Deferred deferred)
      : Napi::AsyncWorker(env),
        typed_array_ref_(Napi::Persistent(typed_array)),
        type_(type),
        data_(data),
        length_(length),
        desc_(desc),
        deferred_(deferred) {}

  void Execute() override {
    if (length_ > 1) {
      DispatchSort(type_, data_, length_, desc_);
    }
  }

  void OnOK() override {
    deferred_.Resolve(typed_array_ref_.Value());
  }

  void OnError(const Napi::Error& e) override {
    deferred_.Reject(e.Value());
  }

 private:
  Napi::Reference<Napi::TypedArray> typed_array_ref_;
  napi_typedarray_type type_;
  void* data_;
  size_t length_;
  bool desc_;
  Napi::Promise::Deferred deferred_;
};

Napi::Value SortInPlace(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsTypedArray()) {
    Napi::TypeError::New(env, "Expected a TypedArray as first argument").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  napi_value val = info[0];
  napi_typedarray_type type;
  size_t length = 0;
  void* data = nullptr;
  napi_status status = napi_get_typedarray_info(env, val, &type, &length, &data, nullptr, nullptr);
  if (status != napi_ok) {
    Napi::TypeError::New(env, "Failed to get TypedArray info").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  bool desc = false;
  if (info.Length() > 1 && info[1].IsBoolean()) {
    desc = info[1].As<Napi::Boolean>().Value();
  }

  if (length <= 1) {
    return info[0];
  }

  if (!DispatchSort(type, data, length, desc)) {
    Napi::TypeError::New(
        env,
        "Unsupported TypedArray type. Supported: Float32Array, Float64Array, "
        "Int32Array, Uint32Array, BigInt64Array, BigUint64Array, Int16Array, Uint16Array")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  return info[0];
}

Napi::Value SortAsync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsTypedArray()) {
    Napi::TypeError::New(env, "Expected a TypedArray as first argument").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
  napi_typedarray_type type;
  size_t length = 0;
  void* data = nullptr;
  napi_status status = napi_get_typedarray_info(env, typed_array, &type, &length, &data, nullptr, nullptr);
  if (status != napi_ok) {
    Napi::TypeError::New(env, "Failed to get TypedArray info").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  bool desc = false;
  if (info.Length() > 1 && info[1].IsBoolean()) {
    desc = info[1].As<Napi::Boolean>().Value();
  }

  switch (type) {
    case napi_float32_array:
    case napi_float64_array:
    case napi_int32_array:
    case napi_uint32_array:
    case napi_bigint64_array:
    case napi_biguint64_array:
    case napi_int16_array:
    case napi_uint16_array:
      break;
    default:
      Napi::TypeError::New(
          env,
          "Unsupported TypedArray type. Supported: Float32Array, Float64Array, "
          "Int32Array, Uint32Array, BigInt64Array, BigUint64Array, Int16Array, Uint16Array")
          .ThrowAsJavaScriptException();
      return env.Undefined();
  }

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);
  SortWorker* worker = new SortWorker(env, typed_array, type, data, length, desc, deferred);
  worker->Queue();
  return deferred.Promise();
}

}  // namespace

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("sortInPlace", Napi::Function::New(env, SortInPlace));
  exports.Set("sortAsync", Napi::Function::New(env, SortAsync));
  return exports;
}

NODE_API_MODULE(vector_qsort, Init)
