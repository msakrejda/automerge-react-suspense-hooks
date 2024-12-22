import { Id, useDocHandleCache } from "../utils/common";
import { resolveHandle } from "../utils/handle";
import { useRepo } from "./useRepo";

export function useHandle<T>(id: Id) {
  const repo = useRepo();
  const cache = useDocHandleCache<T>();
  return resolveHandle(id, repo, cache);
}
