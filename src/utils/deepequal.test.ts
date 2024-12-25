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
  ])("deepEqual(%j,%j) === %s", (a, b, expected) => {
    expect(deepEqual(a, b)).toBe(expected);
  });
});
