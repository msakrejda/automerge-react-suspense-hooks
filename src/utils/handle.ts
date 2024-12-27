import {
  AnyDocumentId,
  AutomergeUrl,
  DocHandle,
  Repo,
} from "@automerge/automerge-repo";
import PromiseCache from "./promisecache";
import { toAutomergeUrl } from "./automerge";

/**
 * Returns the handle once its document is available. Suspends until then.
 *
 * @param id document id
 * @param repo repo to resolve the handle in
 * @param cache PromiseCache to store the result
 * @returns the handle, once its document is available
 */
export function resolveHandle<T>(
  id: AnyDocumentId,
  repo: Repo,
  cache: PromiseCache<AutomergeUrl, DocHandle<T>>,
) {
  const automergeUrl = toAutomergeUrl(id);
  return cache.resolve(automergeUrl, (url, resolve, reject) => {
    if (!url) {
      reject(new Error("missing url"));
    }
    const handle = repo.find<T>(url);

    if (handle.isReady()) {
      resolve(handle);
    }

    handle
      .whenReady()
      .then(() => resolve(handle))
      .catch(reject);
  });
}
