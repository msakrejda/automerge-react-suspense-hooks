import React, { useState } from "react";

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { generateAutomergeUrl, Repo } from "@automerge/automerge-repo";
import { WithRepo } from "./useRepo";
import { ErrorBoundary } from "../utils/test";
import { useHandle } from "./useHandle";

type DummyDoc = {
  num: number;
};

describe("useHandle", () => {
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
      const doc = useHandle<DummyDoc>(docId);
      return `got handle for ${doc.documentId}`;
    }
    const { container } = render(
      <Host>
        <DocConsumer />
      </Host>,
    );

    expect(container).toHaveTextContent("loading");
    expect(container).not.toHaveTextContent("got handle for");
  });

  it("throws an error if the document is not available from any peer", async () => {
    const docId = generateAutomergeUrl();
    const repo = new Repo();
    function DocConsumer() {
      const handle = useHandle<DummyDoc>(docId);
      return `got handle for ${handle.documentId}`;
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

  it("returns the handle once its document is available", async () => {
    const repo = new Repo();
    const docHandle = repo.create<DummyDoc>({ num: 42 });

    function DocConsumer() {
      const handle = useHandle<DummyDoc>(docHandle.documentId);
      return `got handle for ${handle.documentId}`;
    }
    const result = render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(result.container).toHaveTextContent(
      `got handle for ${docHandle.documentId}`,
    );
  });

  it("throws an error if the document is deleted", async () => {
    const repo = new Repo();
    const docHandle = repo.create<DummyDoc>({ num: 42 });
    function DocConsumer() {
      const handle = useHandle<DummyDoc>(docHandle.documentId);
      return `got handle for ${handle.documentId}`;
    }
    const result = render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );
    repo.delete(docHandle.documentId);

    await docHandle.whenReady(["deleted"]);

    result.rerender(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(result.container).toHaveTextContent(/DocumentDeletedException/);
  });
});
