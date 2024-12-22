import React, { Suspense, useContext, useEffect, useState } from "react";

import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import PromiseCache from "../utils/promisecache";
import { DocHandleCacheContext } from "../utils/common";

export const RepoContext = React.createContext<Repo | undefined>(undefined);


export function useRepo(): Repo {
  const repo = useContext(RepoContext)
  if (!repo) throw new Error("Repo was not found on RepoContext.")
  return repo
}

export function WithRepo({ loader, children }: { loader: React.ReactNode, children: React.ReactNode }) {
  const isServerRender = typeof window == 'undefined';
  const isHydrated = useHydrated();

  const [repo] = useState(() => {
    return isServerRender ? undefined : new Repo({
      network: [new BroadcastChannelNetworkAdapter()],
      storage: new IndexedDBStorageAdapter(),
    });
  });

  if (!isHydrated || isServerRender || !repo) {
    return loader;
  }

  return (
    <RepoContext.Provider value={repo}>
      <DocHandleCacheContext.Provider value={new PromiseCache()}>
        <Suspense fallback={loader}>
          {children}
        </Suspense>
      </DocHandleCacheContext.Provider>
    </RepoContext.Provider>
  );
}

// Borrowed from https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts
let hydrating = true;
function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}
