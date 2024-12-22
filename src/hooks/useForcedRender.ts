import { useCallback, useState } from "react";

/**
 * Returns a function that will force the document to re-render.
 * @returns render function
 */
export function useForcedRender(): () => void {
  const [, forceUpdate] = useState(0);
  const force = useCallback(() => {
    forceUpdate((s) => s + 1);
  }, [forceUpdate]);
  return force;
}
