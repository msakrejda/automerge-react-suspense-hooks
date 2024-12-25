import { AutomergeUrl } from "@automerge/automerge-repo";
import { useDocHandleCache } from "../utils/common";
import { resolveHandle } from "../utils/handle";
import { useRepo } from "./useRepo";

/**
 * Returns the handle once its document is available. Suspends until then.
 *
 * @param url document URL
 * @returns
 */
export function useHandle<T>(url: AutomergeUrl) {
  const repo = useRepo();
  const cache = useDocHandleCache<T>();
  return resolveHandle(url, repo, cache);
}
