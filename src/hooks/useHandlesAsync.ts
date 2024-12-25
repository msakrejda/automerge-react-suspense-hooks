import { AutomergeUrl } from "@automerge/automerge-repo";

import { useRepo } from "./useRepo";

export function useHandlesAsync<T>(ids: AutomergeUrl[]) {
  const repo = useRepo();
  return ids.map((id) => {
    return repo.find<T>(id);
  });
}
