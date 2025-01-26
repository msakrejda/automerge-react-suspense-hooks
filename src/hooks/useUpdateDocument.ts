import { useCallback } from "react";
import { ChangeFn, ChangeOptions } from "@automerge/automerge";
import { AnyDocumentId } from "@automerge/automerge-repo";

import { useHandle } from "./useHandle";
import { toAutomergeUrl } from "../utils/automerge";

/**
 * Returns a function to update the given document. The function will be passed
 * the document's current state to mutate.
 *
 * @param id of document to update
 * @returns function to update the document
 */
export function useUpdateDocument<Document>(id: AnyDocumentId) {
  const url = toAutomergeUrl(id);
  const handle = useHandle<Document>(url);

  return useCallback(
    (changeFn: ChangeFn<Document>, options?: ChangeOptions<Document>) => {
      if (!handle) return;
      handle.change(changeFn, options);
    },
    [handle],
  );
}
