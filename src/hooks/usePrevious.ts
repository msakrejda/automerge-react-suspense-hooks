import { useRef, useEffect } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const saved = useRef<T | undefined>(undefined);
  useEffect(() => {
    saved.current = value;
  });
  return saved.current;
}
