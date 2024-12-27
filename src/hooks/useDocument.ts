import { useEffect } from "react";
import { Doc } from "@automerge/automerge";
import { AnyDocumentId } from "@automerge/automerge-repo";

import { useForcedRender } from "./useForcedRender";
import { useHandle } from "./useHandle";
import { DocumentDeletedException } from "../utils/exception";
import { assert } from "../utils/assert";

/**
 * Gets the specified document from the repo.
 *
 * Suspends until the document loads.
 *
 * @param id the document to load
 * @throws @type DocumentDeletedException if the document is deleted
 * @returns the loaded document
 */
export function useDocument<T>(id: AnyDocumentId): Doc<T> {
  const rerender = useForcedRender();
  const handle = useHandle<T>(id);

  useEffect(() => {
    // We don't need to rerender for the initial doc: since we wait for the
    // document to first be ready via useHandle above before we proceed to here,
    // first the return value is that initial doc.
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

    throw new DocumentDeletedException(id);
  }

  return doc;
}
