import { useCallback } from "react";
import { ChangeFn } from "@automerge/automerge";

import { useRepo } from "./useRepo";

export function useCreateDocument<T>() {
  const repo = useRepo();

  return useCallback(
    (changeFn: ChangeFn<T>) => {
      const handle = repo.create(changeFn);
      return handle.documentId;
    },
    [repo],
  );
}
