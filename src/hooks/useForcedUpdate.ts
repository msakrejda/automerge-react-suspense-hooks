import { useCallback, useState } from "react";

export function useForcedUpdate(): () => void {
  const [, forceUpdate] = useState(0);
  const force = useCallback(() => {
    forceUpdate((s) => s + 1);
  }, [forceUpdate]);
  return force;
}