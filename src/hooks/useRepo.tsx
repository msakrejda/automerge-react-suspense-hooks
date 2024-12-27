import React, { Suspense, useContext, useState } from "react";

import { AutomergeUrl, DocHandle, Repo } from "@automerge/automerge-repo";
import PromiseCache from "../utils/promisecache";
import { DocHandleCacheContext } from "../utils/common";

export const RepoContext = React.createContext<Repo | undefined>(undefined);

export function useRepo(): Repo {
  const repo = useContext(RepoContext);
  if (!repo) throw new Error("Repo was not found on RepoContext");
  return repo;
}

export function WithRepo({
  repo,
  loader,
  children,
}: {
  repo?: Repo;
  loader: React.ReactNode;
  children: React.ReactNode;
}) {
  const [promiseCache] = useState(() => {
    return new PromiseCache<AutomergeUrl, DocHandle<unknown>>();
  });

  if (!repo) {
    return loader;
  }

  return (
    <RepoContext.Provider value={repo}>
      <DocHandleCacheContext.Provider value={promiseCache}>
        <Suspense fallback={loader}>{children}</Suspense>
      </DocHandleCacheContext.Provider>
    </RepoContext.Provider>
  );
}
