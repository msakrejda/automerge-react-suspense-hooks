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

  // Both a and b are defined now, because if both were undefined, we exit at
  // the first check, and if either one, we exit at the second check.

  return Object.keys(a as object).length == Object.keys(b as object).length &&
    Array.isArray(a) &&
    Array.isArray(b)
    ? a.every((item, i) => deepEqual(item, b.at(i)))
    : typeof a === "object" &&
        typeof b === "object" &&
        Object.entries(a as Record<string | symbol, unknown>).every(
          ([key, value]) => {
            return deepEqual(
              value,
              (b as Record<string | symbol, unknown>)[key],
            );
          },
        );
}
