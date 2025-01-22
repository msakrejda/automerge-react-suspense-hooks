import { useEffect, useMemo, useRef, useState } from "react";

import {
  AnyDocumentId,
  AutomergeUrl,
  Doc,
  DocHandle,
  DocHandleChangePayload,
  DocHandleDeletePayload,
  stringifyAutomergeUrl,
} from "@automerge/automerge-repo/slim";
import { deepEqual } from "../utils/deepequal";
import { usePrevious } from "./usePrevious";
import { toAutomergeUrl } from "../utils/automerge";
import { useRepo } from "./useRepo";

type EqualFn<T> = (a: T, b: T) => boolean;
export type DocInfo<T> = {
  id: AutomergeUrl;
  state: DocHandle<T>["state"];
  doc: Doc<T> | undefined;
};

type ChangeListener<T> = (p: DocHandleChangePayload<T>) => void;
type DeleteListener<T> = (p: DocHandleDeletePayload<T>) => void;
type Listeners<T> = { change: ChangeListener<T>; delete: DeleteListener<T> };

/**
 * Reduce a list of documents to a selection.
 */
type Selector<Document, Selection> = (items: DocInfo<Document>[]) => Selection;

/**
 * Options to useDocuments hook.
 */
type UseDocumentsOpts<Document, Selection = Document> = {
  /**
   * Selector to use.
   */
  selector?: Selector<Document, Selection>;
  /**
   * Equality function to use with Selections, in order to determine whether to
   * re-render based on the new Selection.
   */
  equal?: EqualFn<Selection>;
};

/**
 * Reduce a list of documents to a map of document URLs to their contents.
 *
 * @param documents the documents to reduce
 * @returns a map of document URL to document contents
 */
export function defaultSelector<T>(documents: DocInfo<T>[]) {
  return documents.reduce<Map<AutomergeUrl, Doc<T> | undefined>>((map, doc) => {
    map.set(doc.id, doc.doc);
    return map;
  }, new Map<AutomergeUrl, Doc<T>>());
}

/**
 * Reduce the given set of documents to a single Selection. Watches the
 * specified documents for changes, but will only cause a re-render if
 * the changes effect a change in the Selection.
 *
 * @param ids list of documents to monitor
 * @param opts options (see @type UseDocumentsOpts)
 * @returns the derived Selection
 */
export function useDocumentSelection<
  Document,
  Selection = ReturnType<typeof defaultSelector<Document>>,
>(ids: AnyDocumentId[], opts?: UseDocumentsOpts<Document, Selection>) {
  const repo = useRepo();
  // Use the latest selector that was passed in without forcing a re-render when
  // it changes by putting it in a ref.
  const selectorRef = useRef(
    opts?.selector ?? (defaultSelector as Selector<Document, Selection>),
  );
  selectorRef.current =
    opts?.selector ?? (defaultSelector as Selector<Document, Selection>);

  const equal = opts?.equal ?? deepEqual;
  const [listeners] = useState(
    () => new Map<AutomergeUrl, Listeners<Document>>(),
  );
  const prevIds = usePrevious(ids);
  const handles = useMemo(() => {
    return ids.map((id) => {
      return repo.find<Document>(id);
    });
  }, ids);
  const [selection, setSelection] = useState(() => {
    const currentDocs = handles.map((h) => ({
      id: h.url,
      doc: h.docSync(),
      state: h.state,
    }));
    return selectorRef.current(currentDocs);
  });

  // Update the selection
  useEffect(() => {
    if (!prevIds) {
      return;
    }
    if (
      prevIds.length === ids.length &&
      ids.every((id) => prevIds.includes(id))
    ) {
      return;
    }

    function updateSelection() {
      const currentDocs = handles.map((h) => ({
        id: h.url,
        doc: h.docSync(),
        state: h.state,
      }));
      const newSelection = selectorRef.current(currentDocs);
      if (equal(selection, newSelection)) {
        return;
      }
      setSelection(newSelection);
    }

    function listen(handle: DocHandle<Document>) {
      const docListeners: Listeners<Document> = {
        change: ({ doc }) => {
          if (!doc) {
            return;
          }
          updateSelection();
        },
        delete: () => {
          updateSelection();
        },
      };
      handle.on("change", docListeners.change);
      handle.on("delete", docListeners.delete);

      const url = stringifyAutomergeUrl(handle.documentId);
      listeners.set(url, docListeners);
    }

    function addDocument(id: AnyDocumentId) {
      const url = toAutomergeUrl(id);
      const handle = repo.find<Document>(url);
      if (handle.docSync()) {
        updateSelection();
        listen(handle);
      } else {
        // As each document loads, update our selection
        handle
          .doc()
          .then(() => {
            updateSelection();
            listen(handle);
          })
          .catch((err) => {
            console.error(
              `Error loading document ${url} in useDocuments: `,
              err,
            );
          });
      }
    }

    ids.filter((id) => !prevIds?.includes(id)).forEach(addDocument);

    // And clean up if necessary, removing listeners
    function unlisten(id: AnyDocumentId) {
      const url = toAutomergeUrl(id);
      const handle = repo.find<Document>(url);
      const docListeners = listeners.get(url);
      if (!docListeners) {
        console.warn(`was not listening for changes to document ${url}`);
        return;
      }
      handle.off("change", docListeners.change);
      handle.off("delete", docListeners.delete);
      listeners.delete(url);
    }
    prevIds?.filter((id) => !ids.includes(id))?.forEach(unlisten);
  }, [ids, prevIds, handles, listeners, repo]);

  return selection;
}
