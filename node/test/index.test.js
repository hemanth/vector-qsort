import test from 'node:test';
import assert from 'node:assert/strict';
import vsort from '../index.js';

test('vector-qsort: all typed array types ascending and descending', () => {
  const types = [
    { ctor: Float32Array, sample: [3.14, -1.5, 42.0, 0, -100.5, 2.71] },
    { ctor: Float64Array, sample: [3.14159265, -1.5, 42.0, 0, -100.5, 2.71828] },
    { ctor: Int32Array, sample: [42, -10, 0, 9999, -50000, 7] },
    { ctor: Uint32Array, sample: [42, 10, 0, 9999, 50000, 7] },
    { ctor: BigInt64Array, sample: [42n, -10n, 0n, 9999999999n, -50000n, 7n] },
    { ctor: BigUint64Array, sample: [42n, 10n, 0n, 9999999999n, 50000n, 7n] },
    { ctor: Int16Array, sample: [42, -10, 0, 9999, -15000, 7] },
    { ctor: Uint16Array, sample: [42, 10, 0, 9999, 50000, 7] }
  ];

  for (const { ctor, sample } of types) {
    const arrAsc = new ctor(sample);
    vsort(arrAsc);
    for (let i = 0; i < arrAsc.length - 1; i++) {
      assert.ok(arrAsc[i] <= arrAsc[i + 1], `Ascending order failed for ${ctor.name}`);
    }

    const arrDesc = new ctor(sample);
    vsort(arrDesc, { desc: true });
    for (let i = 0; i < arrDesc.length - 1; i++) {
      assert.ok(arrDesc[i] >= arrDesc[i + 1], `Descending order failed for ${ctor.name}`);
    }
  }
});

test('vector-qsort: edge cases (empty, single element, duplicates, sorted, reverse)', () => {
  // Empty
  const empty = new Float32Array([]);
  vsort(empty);
  assert.equal(empty.length, 0);

  // Single element
  const single = new Int32Array([42]);
  vsort(single);
  assert.equal(single[0], 42);

  // All duplicates
  const dupes = new Float32Array([7, 7, 7, 7, 7, 7, 7]);
  vsort(dupes);
  assert.deepEqual(Array.from(dupes), [7, 7, 7, 7, 7, 7, 7]);

  // Already sorted
  const sorted = new Int32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  vsort(sorted);
  assert.deepEqual(Array.from(sorted), [1, 2, 3, 4, 5, 6, 7, 8]);

  // Reverse sorted
  const reversed = new Int32Array([8, 7, 6, 5, 4, 3, 2, 1]);
  vsort(reversed);
  assert.deepEqual(Array.from(reversed), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('vector-qsort: vsort.sorted() returns a sorted copy without mutating original', () => {
  const orig = new Float32Array([5, 3, 1, 4, 2]);
  const sorted = vsort.sorted(orig);

  assert.notEqual(orig, sorted);
  assert.deepEqual(Array.from(orig), [5, 3, 1, 4, 2]);
  assert.deepEqual(Array.from(sorted), [1, 2, 3, 4, 5]);

  const desc = vsort.sorted(orig, { desc: true });
  assert.deepEqual(Array.from(desc), [5, 4, 3, 2, 1]);
});

test('vector-qsort: vsort.async() sorts in background thread', async () => {
  const size = 100_000;
  const arr = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = Math.random() * 1000;
  }

  const res = await vsort.async(arr);
  assert.equal(res, arr);
  for (let i = 0; i < size - 1; i++) {
    assert.ok(arr[i] <= arr[i + 1]);
  }
});

test('vector-qsort: large array correctness (100,000 elements)', () => {
  const size = 100_000;
  const arr = new Int32Array(size);
  const v8Copy = new Int32Array(size);
  for (let i = 0; i < size; i++) {
    const val = (Math.random() * 2000000 - 1000000) | 0;
    arr[i] = val;
    v8Copy[i] = val;
  }

  vsort(arr);
  v8Copy.sort();

  for (let i = 0; i < size; i++) {
    assert.equal(arr[i], v8Copy[i]);
  }
});

test('vector-qsort: type checks and error handling', () => {
  assert.ok(vsort.supported(new Float32Array(1)));
  assert.ok(vsort.supported(new BigInt64Array(1)));
  assert.ok(!vsort.supported(new Uint8Array(1)));
  assert.ok(!vsort.supported([1, 2, 3]));

  assert.throws(() => vsort([1, 2, 3]), /Expected a TypedArray/);
  assert.throws(() => vsort(new Uint8Array(10)), /Unsupported TypedArray type/);
});
