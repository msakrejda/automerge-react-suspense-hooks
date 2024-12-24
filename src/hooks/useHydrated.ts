import { useEffect, useState } from "react";

// Borrowed from https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts
let hydrating = true;
export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}
