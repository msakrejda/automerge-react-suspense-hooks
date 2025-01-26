# automerge-react-suspense-hooks

A set of React hooks for working with [Automerge](https://automerge.org/) documents
using React's [Suspense](https://react.dev/reference/react/Suspense)-based APIs.

Note that Automerge includes a [first-party React hooks
integration](https://automerge.org/automerge-repo/modules/_automerge_automerge_repo_react_hooks.html);
you may want to use that instead.

The official hooks do _not_ integrate with Suspense, but see [this pull
request](https://github.com/automerge/automerge-repo/pull/402).

## Installing

```
pnpm add automerge-react-suspense-hooks
```

## Usage

All hooks must be used in children of the `WithRepo` context component:

```tsx
import { Repo } from "@automerge/automerge-repo";
import { WithRepo } from "automerge-react-suspense-hooks";

export function AutomergeApp({ repo }: { repo: Repo }) {
  return (
    <WithRepo repo={repo}>
      <DocumentView>
    </WithRepo>
  )
}
```

Note that this component also acts as a Suspense boundary (though you may add
other Suspense boundaries nested under it).

### useDocument

To get the state of a single document, use `useDocument`:

```ts
/**
 * Retrieves the current state of the document (and causes a re-render whenever
 * the document changes). Suspends until the document is loaded.
 *
 * @param id the document to load
 * @throws @type DocumentDeletedException if the document is deleted
 * @throws @type DocumentUnavailableException if the document is unavailable
 * @returns the loaded document
 */
function useDocument<Document>(id: AnyDocumentId): Doc<Document>;
```

### useDocumentSelection

To derive a state from several documents, or for watching a subset of a single
document, use `useDocumentSelection`:

```ts
/**
 * Reduce the given set of documents to a single Selection. Watches the
 * specified documents for changes, but will only cause a re-render if
 * the changes effect a change in the Selection.
 *
 * @param ids list of documents to monitor
 * @param opts options (see @type UseDocumentsOpts)
 * @returns the derived Selection
 */
function useDocumentSelection<Document, Selection>(
  ids: AnyDocumentId[],
  opts?: UseDocumentsOpts<Document, Selection>,
): Selection;
```

The options are as follows:

```ts
/**
 * Options to useDocuments hook.
 */
type UseDocumentsOpts<Document, Selection = Document> = {
  /**
   * Selector to use (see below).
   */
  selector?: Selector<Document, Selection>;
  /**
   * Equality function to use with Selections, in order to determine whether to
   * re-render based on the new Selection.
   */
  equal?: EqualFn<Selection>;
};
```

Selectors transform a list of documents to a Selection:

```ts
/**
 * Reduce a list of documents to a selection.
 */
type Selector<Document, Selection> = (
  items: DocHandle<Document>[],
) => Selection;
```

The default selector returns a map of Automerge URL to current document state.
The default equal implementation is a built-in `deepEqual` function.

### useCreateDocument

```ts
/**
 * Returns a function that can be used to create documents in the current repo.
 *
 * @returns function that accepts an initial value and returns the new document's url
 */
function useCreateDocument<Document>();
```

### useUpdateDocument

```ts
/**
 * Returns a function to update the given document. The function will be passed
 * the document's current state to mutate.
 *
 * @param id of document to update
 * @returns function to update the document
 */
export function useUpdateDocument<Document>(id: AnyDocumentId);
```
