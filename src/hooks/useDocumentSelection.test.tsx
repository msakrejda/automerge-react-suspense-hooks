import React, { useState } from "react";

import { describe, it, expect, vitest } from "vitest";
import { render } from "@testing-library/react";

import { AutomergeUrl, Doc, DocHandle, Repo } from "@automerge/automerge-repo";
import { WithRepo } from "./useRepo";
import { ErrorBoundary } from "../utils/test";
import { useDocumentSelection } from "./useDocumentSelection";

type DummyDoc = {
  num: number;
};

describe("useDocumentSelection", () => {
  function Host({
    children,
    repo: optRepo,
  }: {
    children: React.ReactNode;
    repo?: Repo;
  }) {
    const [repo] = useState(optRepo ?? (() => new Repo()));
    return (
      <WithRepo repo={repo} loader="loading">
        <ErrorBoundary>{children}</ErrorBoundary>
      </WithRepo>
    );
  }

  it("returns a map of url to current document state", async () => {
    let selection: Map<AutomergeUrl, Doc<DummyDoc> | undefined> | null = null;
    const repo = new Repo();
    const handle = repo.create<DummyDoc>({ num: 42 });
    function DocConsumer() {
      const doc = useDocumentSelection<DummyDoc>([handle.documentId]);
      selection = doc;
      return `loaded selection`;
    }
    render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(selection).toBeDefined();
    expect(selection!.size).toEqual(1);
    expect(selection!.get(handle.url)).toEqual({ num: 42 });
  });

  it("returns an arbitrary derived value with a custom selector", async () => {
    const selection = {};
    const selector = vitest.fn().mockReturnValue(selection);

    let result: typeof selection | null = null;
    const repo = new Repo();
    const handle = repo.create<DummyDoc>({ num: 42 });
    function DocConsumer() {
      result = useDocumentSelection<DummyDoc>([handle.url], {
        selector,
      });
      return `loaded selection`;
    }
    render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(result).toBe(selection);

    expect(selector).toHaveBeenCalledOnce();
    const args = selector.mock.lastCall!;
    expect(args.length).toBe(1);
    const handles = args[0] as DocHandle<DummyDoc>[];
    expect(args.length).toBe(1);

    const receivedHandle = handles[0];
    expect(receivedHandle.url).toEqual(handle.url);
    expect(receivedHandle.docSync()).toEqual({ num: 42 });
  });
});
