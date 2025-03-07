import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";
import { Repo } from "@automerge/automerge-repo";

import { useRepo, WithRepo } from "./useRepo";
import { ErrorBoundary } from "../utils/test";

describe("WithRepo", () => {
  it("renders the loader if no repo is passed in", () => {
    const result = render(
      <WithRepo loader="loading">automerge stuff</WithRepo>,
    );
    expect(result.getByText("loading")).toBeDefined();
  });
  it("renders the content if a repo is provided", () => {
    const repo = new Repo();
    const result = render(
      <WithRepo repo={repo} loader="loading">
        automerge stuff
      </WithRepo>,
    );
    expect(result.getByText("automerge stuff")).toBeDefined();
  });
});

describe("useRepo", () => {
  it("returns the repo provided by WithRepo", () => {
    const repo = new Repo();
    let hookRepo: Repo | undefined = undefined;
    function DocConsumer() {
      hookRepo = useRepo();
      return null;
    }
    render(
      <WithRepo repo={repo} loader="loading">
        <DocConsumer />
      </WithRepo>,
    );

    expect(repo).toBe(hookRepo);
  });
  it("throws if not within a context", () => {
    function DocConsumer() {
      useRepo();
      return null;
    }
    const result = render(
      <ErrorBoundary>
        <DocConsumer />
      </ErrorBoundary>,
    );

    expect(
      result.getByText("Error: Repo was not found on RepoContext"),
    ).toBeDefined();
  });
});
