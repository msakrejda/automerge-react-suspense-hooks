import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { usePrevious } from "./usePrevious";

describe("usePrevious", () => {
  it("returns the previous value passed in on last render", () => {
    let previous = undefined;
    function UsePreviousConsumer({ value }: { value: number }) {
      previous = usePrevious(value);
      return null;
    }
    const { rerender } = render(<UsePreviousConsumer value={1} />);

    expect(previous).toBe(undefined);

    rerender(<UsePreviousConsumer value={2} />);

    expect(previous).toBe(1);

    rerender(<UsePreviousConsumer value={4} />);

    expect(previous).toBe(2);
  });
});
