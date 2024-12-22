import { Id } from "../utils/common";
import { useRepo } from "./useRepo";

export function useHandlesAsync<T>(ids: Id[]) {
  const repo = useRepo();
  return ids.map((id) => {
    return repo.find<T>(id);
  });
}
