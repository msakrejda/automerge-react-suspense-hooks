import React, { useState } from "react";

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { AutomergeUrl, Doc, Repo } from "@automerge/automerge-repo";
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

  it("returns a map of url to current document state with default selector", async () => {
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

    await handle.whenReady();

    expect(selection).toBeDefined();
    expect(selection!.size).toEqual(1);
    expect(selection!.get(handle.url)).toEqual({ num: 42 });
  });
});
