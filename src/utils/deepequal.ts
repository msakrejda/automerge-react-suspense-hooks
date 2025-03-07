/**
 * Compare two documents using a naive deep equality comparison.
 *
 * @param a document to be compared
 * @param b other document to be compared
 * @returns true if the two documents are deep-equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // We don't care about the type of b for the scope of `scalar`: if at least
  // one compared value is scalar, the logic below should hold.
  const scalar = typeof a !== "object";
  const identical = a === b;
  if (identical || scalar) {
    return identical;
  }

  if ((a == null && b != null) || (a != null && b == null)) {
    return false;
  }
  if ((a === null && b === undefined) || (a === undefined && b === null)) {
    return false;
  }

  // Both a and b are defined now, because if both were undefined, we exit at
  // the first check, and if either one, we exit at the second check.

  if (Object.keys(a as object).length !== Object.keys(b as object).length) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((item, i) => deepEqual(item, b.at(i)));
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) {
      return false;
    }
    for (const [k, aVal] of a) {
      const bVal = b.get(k);
      const equal = deepEqual(aVal, bVal);
      if (!equal) {
        return false;
      }
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) {
      return false;
    }
    for (const entry of a) {
      if (!b.has(entry)) {
        return false;
      }
    }
    return true;
  }

  if (typeof a === "object" && typeof b === "object") {
    return Object.entries(a as Record<string | symbol, unknown>).every(
      ([key, value]) => {
        return deepEqual(value, (b as Record<string | symbol, unknown>)[key]);
      },
    );
  }

  console.warn("Unexpected deepEqual case:", a, b);
  return false;
}
