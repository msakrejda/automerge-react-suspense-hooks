import { useEffect, useRef, useState } from "react"

import { useRepo } from "@automerge/automerge-repo-react-hooks"
import {
  AutomergeUrl,
  Doc,
  DocHandle,
  DocHandleChangePayload,
  DocHandleDeletePayload,
  DocumentId,
  stringifyAutomergeUrl,
} from "@automerge/automerge-repo/slim"
import { deepEqual } from "../utils/deepequal";
import { usePrevious } from "./usePrevious";
import { useHandlesAsync } from "./useHandlesAsync";

type DeepEqualComparator<T> = (a: T, b: T) => boolean;
type DocInfo<T> = {
  id: AutomergeUrl;
  state: DocHandle<T>['state'];
  doc: Doc<T> | undefined;
};
type Selector<Document,Selection> = (items: DocInfo<Document>[]) => Selection;

type UseDocumentsOpts<Document, Selection=Document> = {
  selector?: Selector<Document,Selection>;
  deepEqual?: DeepEqualComparator<Selection>;
};

function defaultSelector<T>(documents: DocInfo<T>[]) {
  return documents.reduce<Map<AutomergeUrl, Doc<T> | undefined>>((map, doc) => {
    map.set(doc.id, doc.doc);
    return map;
  }, new Map<AutomergeUrl, Doc<T>>());
}

/**
 * 
 * @param idsOrUrls 
 * @param opts options (see @type UseDocumentsOpts)
 * @returns 
 */
export function useDocumentSelection <Document, Selection=Document>(urls: AutomergeUrl[], opts?: UseDocumentsOpts<Document, Selection>) {
  const repo = useRepo()
  const selectorRef = useRef(opts?.selector ?? defaultSelector as Selector<Document, Selection>);
  selectorRef.current = opts?.selector ?? defaultSelector as Selector<Document, Selection>;

  const comparatorRef = useRef(opts?.deepEqual ?? deepEqual);
  comparatorRef.current = opts?.deepEqual ?? deepEqual;

  const listeners = useRef(new Map<DocId, Listeners<Document>>());

  const prevUrls = usePrevious(urls);
  const handles = useHandlesAsync<Document>(urls);
  const [selection, setSelection] = useState(() => {
    const currentDocs = handles.map((h, i) => ({ id: urls[i], doc: h.docSync(), state: h.state }));
    return selectorRef.current(currentDocs);
  });

  // now update subscriptions
  useEffect(() => {
    function updateSelection() {
      const currentDocs = handles.map((h, i) => ({ id: urls[i], doc: h.docSync(), state: h.state }));
      const newSelection = selectorRef.current(currentDocs);
      if (comparatorRef.current!(selection, newSelection)) {
        return;
      }
      setSelection(newSelection);
    }

    const addListener = (handle: DocHandle<Document>) => {
      const url = stringifyAutomergeUrl(handle.documentId)

      // whenever a document changes, update our map
      const listenersForDoc: Listeners<Document> = {
        change: ({ doc }) => {
          if (!doc) {
            return;
          }
          updateSelection();
        },
        delete: () => {
          updateSelection();
        }
      }
      handle.on("change", listenersForDoc.change)
      handle.on("delete", listenersForDoc.delete)

      listeners.current.set(url, listenersForDoc);
    }

    // Add a new document to our map
    const addNewDocument = (url: AutomergeUrl) => {
      const handle = repo.find<Document>(url)
      if (handle.docSync()) {
        updateSelection()
        addListener(handle)
      } else {
        // As each document loads, update our map
        handle
          .doc()
          .then(() => {
            updateSelection()
            addListener(handle)
          })
          .catch(err => {
            console.error(
              `Error loading document ${url} in useDocuments: `,
              err
            )
          })
      }
    }

    for (const url of urls) {
      const handle = repo.find<Document>(url)
      if (prevUrls?.includes(url)) {
        // the document was already in our list before.
        // we only need to register new listeners.
        addListener(handle)
      } else {
        // This is a new document that was not in our list before.
        // We need to update its state in the documents array and register
        // new listeners.
        addNewDocument(url)
      }
    }

    // stop listening for changes on any documents that are no longer in the list
    prevUrls?.filter(url => !urls.includes(url))?.forEach((url) => {
      const handle = repo.find<Document>(url as AutomergeUrl);
      const docListeners = listeners.current.get(url);
      if (!docListeners) {
        console.warn(`was not listening for changes to document ${url}`);
        return;
      }
      handle.off("change", docListeners.change);
      handle.off("delete", docListeners.delete);      
    });
  }, [urls, repo])

  return selection
}

type DocId = DocumentId | AutomergeUrl
type ChangeListener<T> = (p: DocHandleChangePayload<T>) => void
type DeleteListener<T> = (p: DocHandleDeletePayload<T>) => void
type Listeners<T> = { change: ChangeListener<T>; delete: DeleteListener<T> }
