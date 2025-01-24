import { describe, expect, it } from "vitest";
import { deepEqual } from "./deepequal";

describe("deepEqual", () => {
  it.each([
    [null, null, true],
    [undefined, undefined, true],
    [null, undefined, false],
    [undefined, null, false],
    [1, null, false],
    [1, 1, true],
    [[1], [1], true],
    [[1], [1, 1], false],
    [{ a: 1 }, { a: 1 }, true],
    [{ a: 1 }, { a: 1, b: 2 }, false],
    [{ a: 1, b: 2 }, { a: 1 }, false],
    [{ a: { b: 2 } }, { a: { b: 2 } }, true],
    [new Map([[1, 2]]), new Map([[1, 2]]), true],
    [new Map([[1, 2]]), new Map([[2, 3]]), false],
    [
      new Map([[1, 2]]),
      new Map([
        [1, 2],
        [2, 3],
      ]),
      false,
    ],
    [new Set([1, 2]), new Set([1, 2]), true],
    [new Set([1, 2]), new Set([1, 3]), false],
    [new Set([1, 2]), new Set([1, 2, 3]), false],
  ])("deepEqual(%j,%j) === %s", (a, b, expected) => {
    expect(deepEqual(a, b)).toBe(expected);
  });
});
