import { Id, useDocHandleCache } from "../utils/common";
import { resolveHandles } from "../utils/handle";
import { useRepo } from "./useRepo";

export function useHandles<T>(ids: Id[]) {
  const repo = useRepo();
  const cache = useDocHandleCache<T>();
  return resolveHandles(ids, repo, cache);
}
