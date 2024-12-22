import { useCallback } from "react";
import { ChangeFn, ChangeOptions } from "@automerge/automerge";

import { Id } from "../utils/common";
import { useHandle } from "./useHandle";

export function useUpdateDocument<T>(id: Id) {
  const handle = useHandle<T>(id);

  return useCallback(
    (changeFn: ChangeFn<T>, options?: ChangeOptions<T> | undefined) => {
      if (!handle) return;
      handle.change(changeFn, options);
    },
    [handle],
  );
}
