import React, { useEffect } from "react";

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import {
  AutomergeUrl,
  isValidAutomergeUrl,
  Repo,
} from "@automerge/automerge-repo";
import { WithRepo } from "./useRepo";
import { useCreateDocument } from "./useCreateDocument";

type DummyDoc = {
  num: number;
};

describe("useCreateDocument", () => {
  function Host({ children, repo }: { children: React.ReactNode; repo: Repo }) {
    return (
      <WithRepo repo={repo} loader="loading">
        {children}
      </WithRepo>
    );
  }

  it("creates a document with the specified properties and returns the handle", async () => {
    let docId: AutomergeUrl | null = null;
    const repo = new Repo();
    function DocConsumer() {
      const createDoc = useCreateDocument<DummyDoc>();
      useEffect(() => {
        docId = createDoc({ num: 42 });
      }, [createDoc]);
      return null;
    }
    render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    expect(docId).not.toBeNull();
    expect(isValidAutomergeUrl(docId)).toBe(true);

    const doc = repo.find<DummyDoc>(docId!).docSync();
    expect(doc).toBeDefined();
    expect(doc!.num).toEqual(42);
  });
});
