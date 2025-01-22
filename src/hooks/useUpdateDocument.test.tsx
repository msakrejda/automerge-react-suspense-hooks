import React, { useEffect } from "react";

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Repo } from "@automerge/automerge-repo";
import { WithRepo } from "./useRepo";
import { useUpdateDocument } from "./useUpdateDocument";

type DummyDoc = {
  num: number;
};

describe("useUpdateDocument", () => {
  function Host({ children, repo }: { children: React.ReactNode; repo: Repo }) {
    return (
      <WithRepo repo={repo} loader="loading">
        {children}
      </WithRepo>
    );
  }

  it("updates an existing document", async () => {
    const repo = new Repo();
    const handle = repo.create({ num: 42 });

    function DocConsumer() {
      const updateDoc = useUpdateDocument<DummyDoc>(handle.url);
      useEffect(() => {
        updateDoc!((doc) => (doc.num = 45));
      }, [updateDoc]);
      return null;
    }
    render(
      <Host repo={repo}>
        <DocConsumer />
      </Host>,
    );

    const doc = handle.docSync();

    expect(doc).not.toBeNull();
    expect(doc?.num).toEqual(45);
  });
});
