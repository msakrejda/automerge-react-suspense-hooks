import { AutomergeUrl, DocHandle, Repo } from "@automerge/automerge-repo";
import PromiseCache from "./promisecache";

/**
 * Returns the handle once its document is available. Suspends until then.
 *
 * @param url document URL
 * @param repo repo to resolve the handle in
 * @param cache PromiseCache to store the result
 * @returns the handle, once its document is available
 */
export function resolveHandle<T>(
  url: AutomergeUrl,
  repo: Repo,
  cache: PromiseCache<AutomergeUrl, DocHandle<T>>,
) {
  return cache.resolve(url, (url, resolve, reject) => {
    if (!url) {
      reject(new Error("missing url"));
    }
    const handle = repo.find<T>(url);
    handle
      .doc()
      .then(() => resolve(handle))
      .catch(reject);
  });
}
