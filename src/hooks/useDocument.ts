import { useEffect } from "react";
import { Doc } from "@automerge/automerge";

import { useForcedRender } from "./useForcedRender";
import { useHandle } from "./useHandle";
import { assert, DocumentDeletedException } from "../utils/exception";
import { AutomergeUrl } from "@automerge/automerge-repo";

/**
 * Gets the specified document from the repo.
 *
 * Suspends until the document loads.
 *
 * @param url the document to load
 * @throws @type DocumentDeletedException if the document is deleted
 * @returns the loaded document
 */
export function useDocument<T>(url: AutomergeUrl): Doc<T> {
  const rerender = useForcedRender();
  const handle = useHandle<T>(url);

  useEffect(() => {
    handle
      .doc()
      .then(rerender)
      .catch((e) => console.error(e));

    handle.on("change", rerender);
    handle.on("delete", rerender);

    return () => {
      handle.removeListener("change", rerender);
      handle.removeListener("delete", rerender);
    };
  }, [handle]);

  const doc = handle.docSync();
  if (!doc) {
    // Since useHandle suspends until the document is initially available, we
    // can assume the document will continue to be available until it is deleted
    assert(
      handle.inState(["deleted"]),
      `unexpected handle state: ${handle.state}`,
    );

    throw new DocumentDeletedException(url);
  }

  return doc;
}
