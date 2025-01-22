import {
  AnyDocumentId,
  AutomergeUrl,
  DocHandle,
  Repo,
} from "@automerge/automerge-repo";
import PromiseCache from "./promisecache";
import { toAutomergeUrl } from "./automerge";
import {
  DocumentDeletedException,
  DocumentUnavailableException,
} from "./exception";

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

    if (handle.isDeleted()) {
      reject(new DocumentDeletedException(id));
    }

    if (handle.isUnavailable()) {
      reject(new DocumentUnavailableException(id));
    }

    handle
      .whenReady(["ready", "deleted", "unavailable"])
      .then(() => {
        if (handle.inState(["unavailable"])) {
          reject(new DocumentUnavailableException(id));
        } else if (handle.inState(["deleted"])) {
          reject(new DocumentDeletedException(id));
        } else {
          resolve(handle);
        }
      })
      .catch(reject);
  });
}
