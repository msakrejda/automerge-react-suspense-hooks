import { useCallback } from "react";

import { useRepo } from "./useRepo";

/**
 * Returns a function that can be used to create documents in the current repo.
 *
 * @returns function that accepts an initial value and returns the new document's url
 */
export function useCreateDocument<Document>() {
  const repo = useRepo();

  return useCallback(
    (initialValue: Document) => {
      const handle = repo.create(initialValue);
      return handle.url;
    },
    [repo],
  );
}
