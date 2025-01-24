import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AnyDocumentId,
  AutomergeUrl,
  Doc,
  DocHandle,
  DocHandleChangePayload,
  DocHandleDeletePayload,
} from "@automerge/automerge-repo/slim";
import { deepEqual } from "../utils/deepequal";
import { usePrevious } from "./usePrevious";
import { useRepo } from "./useRepo";
import { useForcedRender } from "./useForcedRender";

type EqualFn<T> = (a: T, b: T) => boolean;

type ChangeListener<T> = (p: DocHandleChangePayload<T>) => void;
type DeleteListener<T> = (p: DocHandleDeletePayload<T>) => void;
type Listeners<T> = { change: ChangeListener<T>; delete: DeleteListener<T> };

/**
 * Reduce a list of documents to a selection.
 */
type Selector<Document, Selection> = (
  items: DocHandle<Document>[],
) => Selection;

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
 * @param documents handles of the documents to reduce
 * @returns a map of document URL to document contents
 */
export function defaultSelector<T>(documents: DocHandle<T>[]) {
  return documents.reduce<Map<AutomergeUrl, Doc<T> | undefined>>(
    (map, handle) => {
      map.set(handle.url, handle.docSync());
      return map;
    },
    new Map<AutomergeUrl, Doc<T>>(),
  );
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
  const rerender = useForcedRender();
  // Use the latest selector that was passed in without forcing a re-render when
  // it changes by putting it in a ref.
  // TODO: Is this a bad idea?
  const selectorRef = useRef(
    opts?.selector ?? (defaultSelector as Selector<Document, Selection>),
  );
  selectorRef.current =
    opts?.selector ?? (defaultSelector as Selector<Document, Selection>);

  const equal = opts?.equal ?? deepEqual;
  const [listeners] = useState(
    () => new Map<AutomergeUrl, Listeners<Document>>(),
  );
  const handles = useMemo(() => {
    return ids.map((id) => {
      return repo.find<Document>(id);
    });
  }, ids);
  const prevHandles = usePrevious(handles);

  const addedHandles = useMemo(() => {
    return handles.filter((handle) => !prevHandles?.includes(handle));
  }, [handles, prevHandles]);
  const removedHandles = useMemo(() => {
    return prevHandles?.filter((handle) => !handles.includes(handle)) ?? [];
  }, [handles, prevHandles]);

  const selection = useRef(selectorRef.current(handles));

  const updateSelection = useCallback(() => {
    const newSelection = selectorRef.current(handles);
    if (equal(selection.current, newSelection)) {
      return;
    }
    selection.current = newSelection;
    rerender();
  }, [handles, rerender, selectorRef, selection]);

  useEffect(() => {
    if (addedHandles.length === 0) {
      return;
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

      listeners.set(handle.url, docListeners);
    }

    addedHandles.forEach(listen);
  }, [addedHandles, listeners]);

  useEffect(() => {
    if (removedHandles.length === 0) {
      return;
    }

    function unlisten(handle: DocHandle<Document>) {
      const url = handle.url;
      const docListeners = listeners.get(url);
      if (!docListeners) {
        console.warn(`was not listening for changes to document ${url}`);
        return;
      }
      handle.off("change", docListeners.change);
      handle.off("delete", docListeners.delete);
      listeners.delete(url);
    }

    removedHandles.forEach(unlisten);
  }, [removedHandles, repo, listeners]);

  return selection.current;
}
