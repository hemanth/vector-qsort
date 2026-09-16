import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadNative() {
  const candidates = [
    join(__dirname, 'build/Release/vector_qsort.node'),
    join(__dirname, 'build/Debug/vector_qsort.node'),
    join(__dirname, 'build/vector_qsort.node'),
    join(__dirname, '../build/Release/vector_qsort.node'),
    join(__dirname, '../build/Debug/vector_qsort.node'),
    join(__dirname, '../build/vector_qsort.node'),
    join(__dirname, 'prebuilds', `${process.platform}-${process.arch}`, 'vector_qsort.node'),
    join(__dirname, '../prebuilds', `${process.platform}-${process.arch}`, 'vector_qsort.node')
  ];
  for (const path of candidates) {
    if (existsSync(path)) return require(path);
  }
  throw new Error('Could not locate vector_qsort native addon binary. Run `npm run build`.');
}

const native = loadNative();

function parseDesc(options) {
  if (typeof options === 'boolean') return options;
  if (options && typeof options === 'object') return Boolean(options.desc);
  return false;
}

/**
 * Sort a TypedArray in-place using Google Highway SIMD.
 * @param {TypedArray} array - Target TypedArray to sort in-place
 * @param {Object|boolean} [options] - Options or boolean for descending
 * @returns {TypedArray} - The sorted array (same reference)
 */
export default function vsort(array, options = {}) {
  const desc = parseDesc(options);
  return native.sortInPlace(array, desc);
}

/**
 * Return a sorted copy of a TypedArray without mutating the original.
 * @param {TypedArray} array - Source TypedArray
 * @param {Object|boolean} [options] - Options or boolean for descending
 * @returns {TypedArray} - A new sorted TypedArray copy
 */
vsort.sorted = function sorted(array, options = {}) {
  if (!array || typeof array.slice !== 'function') {
    throw new TypeError('Expected a TypedArray with a .slice() method');
  }
  const copy = array.slice();
  const desc = parseDesc(options);
  return native.sortInPlace(copy, desc);
};

/**
 * Sort a TypedArray asynchronously off the main thread using libuv worker pool.
 * @param {TypedArray} array - Target TypedArray to sort in-place
 * @param {Object|boolean} [options] - Options or boolean for descending
 * @returns {Promise<TypedArray>} - Resolves with the sorted array
 */
vsort.async = function sortAsync(array, options = {}) {
  const desc = parseDesc(options);
  return native.sortAsync(array, desc);
};

/**
 * Check whether an array type is supported by vector-qsort SIMD.
 * @param {*} val
 * @returns {boolean}
 */
vsort.supported = function supported(val) {
  return (
    val instanceof Float32Array ||
    val instanceof Float64Array ||
    val instanceof Int32Array ||
    val instanceof Uint32Array ||
    val instanceof BigInt64Array ||
    val instanceof BigUint64Array ||
    val instanceof Int16Array ||
    val instanceof Uint16Array
  );
};

export { vsort };
