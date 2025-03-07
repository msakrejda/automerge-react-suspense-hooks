import React, { useState } from "react";

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

  it("suspends if the document is not yet available", async () => {
    const docId = generateAutomergeUrl();
    function DocConsumer() {
      const doc = useDocument<DummyDoc>(docId);
      return `loaded doc ${doc.num}`;
    }
    const { container } = render(
      <Host>
        <DocConsumer />
      </Host>,
    );

    expect(container).toHaveTextContent("loading");
    expect(container).not.toHaveTextContent("loaded doc");
  });

  it("throws an error if the document is not available from any peer", async () => {
    const docId = generateAutomergeUrl();
    const repo = new Repo();
    function DocConsumer() {
      const doc = useDocument<DummyDoc>(docId);
      return `loaded doc ${doc.num}`;
    }
    const result = render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    const handle = repo.find(docId);
    await handle.whenReady(["unavailable"]);

    result.rerender(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(result.container).toHaveTextContent("DocumentUnavailableException");
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

    expect(result.container).toHaveTextContent("loaded doc 42");
  });

  it("throws an error if the document is deleted", async () => {
    const repo = new Repo();
    const handle = repo.create<DummyDoc>({ num: 42 });
    function DocConsumer() {
      const doc = useDocument<DummyDoc>(handle.documentId);
      return `loaded doc ${doc.num}`;
    }
    const result = render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );
    repo.delete(handle.documentId);

    result.rerender(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(result.container).toHaveTextContent(/DocumentDeletedException/);
  });
});
