export type SupportedTypedArray =
  | Float32Array
  | Float64Array
  | Int32Array
  | Uint32Array
  | BigInt64Array
  | BigUint64Array
  | Int16Array
  | Uint16Array;

export interface SortOptions {
  desc?: boolean;
}

export interface VectorQSort {
  <T extends SupportedTypedArray>(array: T, options?: SortOptions | boolean): T;
  sorted<T extends SupportedTypedArray>(array: T, options?: SortOptions | boolean): T;
  async<T extends SupportedTypedArray>(array: T, options?: SortOptions | boolean): Promise<T>;
  supported(val: unknown): val is SupportedTypedArray;
}

declare const vsort: VectorQSort;

export default vsort;
export { vsort };
