import { useCallback } from "react";
import { ChangeFn, ChangeOptions } from "@automerge/automerge";
import { AutomergeUrl } from "@automerge/automerge-repo";

import { useHandle } from "./useHandle";

export function useUpdateDocument<T>(url: AutomergeUrl) {
  const handle = useHandle<T>(url);

  return useCallback(
    (changeFn: ChangeFn<T>, options?: ChangeOptions<T>) => {
      if (!handle) return;
      handle.change(changeFn, options);
    },
    [handle],
  );
}
