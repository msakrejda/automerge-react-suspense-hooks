import React, { useState } from "react";

import { DummyStorageAdapter } from "@automerge/automerge-repo/helpers/DummyStorageAdapter.js";

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { generateAutomergeUrl, Repo } from "@automerge/automerge-repo";
import { useRepo, WithRepo } from "./useRepo";
import { ErrorBoundary } from "../utils/test";
import { useDocument } from "./useDocument";

type DummyDoc = {
  num: number;
};

describe("useDocument", () => {
  function Host({ children }: { children: React.ReactNode }) {
    const [repo] = useState(
      () =>
        new Repo({
          storage: new DummyStorageAdapter(),
        }),
    );
    return (
      <WithRepo repo={repo} loader="loading">
        <ErrorBoundary>{children}</ErrorBoundary>
      </WithRepo>
    );
  }

  it("suspends if the document is not yet available", async () => {
    const docId = generateAutomergeUrl();
    function DocConsumer() {
      const doc = useDocument<DummyDoc>(docId);
      return `loaded doc ${doc.num}`;
    }
    const result = render(
      <Host>
        <DocConsumer />
      </Host>,
    );

    expect(result.getByText(`loading`)).toBeDefined();
    expect(result.queryByText(`loaded doc`)).toBeNull();
  });

  it("returns the document once available", async () => {
    function DocConsumer() {
      const repo = useRepo();
      const handle = repo.create<DummyDoc>({ num: 42 });

      const doc = useDocument<DummyDoc>(handle.documentId);
      return `loaded doc ${doc.num}`;
    }
    const result = render(
      <Host>
        <DocConsumer />
      </Host>,
    );

    expect(result.getByText("loaded doc 42")).toBeDefined();
  });
});
