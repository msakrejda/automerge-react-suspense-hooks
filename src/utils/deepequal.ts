/**
 * Compare two documents using a naive deep equality comparison.
 * 
 * @param a document to be compared
 * @param b other document to be compared
 * @returns true if the two documents are deep-equal
 */
export function deepEqual<T extends unknown>(a: T, b: T): boolean {
  if ((a === null && b === null) || (a === undefined && b === undefined)) {
    return true;
  }
  if ((a == null && b != null) || (a != null && b == null)) {
    return false;
  }

  // use direct comparison for scalar values
  if (typeof a !== 'object') {
    return a === b;
  }

  return Object.keys(a as object).length == Object.keys(b as object).length &&
  Array.isArray(a) && Array.isArray(b)
    ? a.every((item, i) => deepEqual(item, b.at(i)))
    : typeof a === 'object' && typeof b == 'object' && Object.entries(a as object).every(([key, value]) => deepEqual(value, (b as any)[key]))
  
}