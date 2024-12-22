import { DocHandle, Repo } from "@automerge/automerge-repo";
import { Id } from "./common";
import PromiseCache from "./promisecache";

/**
 * Return the handle once its document is available. Suspends until then.
 *
 * @param id document id
 * @param repo
 * @param cache
 * @returns
 */
export function resolveHandle<T>(
  id: Id,
  repo: Repo,
  cache: PromiseCache<Id, DocHandle<T>>,
) {
  return cache.resolve(id, (id, resolve, reject) => {
    if (!id) {
      reject(new Error("missing id"));
    }
    const handle = repo.find<T>(id);
    handle
      .doc()
      .then(() => resolve(handle))
      .catch(reject);
  });
}

/**
 * Return handles once all documents are available. Suspends until then.
 *
 * @param ids document ids
 * @param repo
 * @param cache
 * @returns
 */
export function resolveHandles<T>(
  ids: Id[],
  repo: Repo,
  cache: PromiseCache<Id, DocHandle<T>>,
) {
  return cache.resolveAll(ids, (id, resolve, reject) => {
    if (!id) {
      reject(new Error("missing id"));
    }
    const handle = repo.find<T>(id);
    handle
      .doc()
      .then(() => resolve(handle))
      .catch(reject);
  });
}
