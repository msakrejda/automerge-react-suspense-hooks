import { useCallback } from "react";

import { useRepo } from "./useRepo";
import { stringifyAutomergeUrl } from "@automerge/automerge-repo";

/**
 * Returns a function that can be used to create documents in the current repo.
 *
 * @returns function that accepts an initial value and returns the new document's url
 */
export function useCreateDocument<T>() {
  const repo = useRepo();
  repo.create();

  return useCallback(
    (initialValue: T) => {
      const handle = repo.create(initialValue);
      return stringifyAutomergeUrl(handle.documentId);
    },
    [repo],
  );
}
