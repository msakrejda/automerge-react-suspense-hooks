import React, { useEffect, useRef } from "react";

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { useForcedRender } from "./useForcedRender";
import {
  pendingThenable,
  fulfilledThenable,
  Thenable,
} from "../utils/thenable";

describe("useForcedRender", () => {
  function Host({
    children,
  }: {
    children: (
      forceUpdate: () => Promise<void>,
      renderCount: number,
    ) => React.ReactNode;
  }) {
    const renderCount = useRef(1);
    const forceRender = useForcedRender();
    const lastForcedRender = useRef<Thenable<void>>(
      fulfilledThenable(undefined),
    );
    const forceRenderFn = async () => {
      lastForcedRender.current = pendingThenable();
      forceRender();
      await lastForcedRender.current;
    };
    useEffect(() => {
      if (lastForcedRender.current.status === "pending") {
        lastForcedRender.current.resolve();
      }
      renderCount.current += 1;
    });
    return children(forceRenderFn, renderCount.current);
  }

  it("can force a render", async () => {
    let renderCount = 0;
    let forceUpdate = () => Promise.resolve();
    render(
      <Host>
        {(forceUpdate_, renderCount_) => {
          forceUpdate = forceUpdate_;

          renderCount = renderCount_;

          return null;
        }}
      </Host>,
    );

    expect(renderCount).toEqual(1);

    await forceUpdate();

    expect(renderCount).toEqual(2);
  });
});
