import { AnyDocumentId } from "@automerge/automerge-repo";
import { useDocHandleCache } from "../utils/common";
import { resolveHandle } from "../utils/handle";
import { useRepo } from "./useRepo";

/**
 * Returns the handle once its document is available. Suspends until then.
 *
 * @param id document id
 * @returns
 */
export function useHandle<T>(id: AnyDocumentId) {
  const repo = useRepo();
  const cache = useDocHandleCache<T>();
  return resolveHandle(id, repo, cache);
}
