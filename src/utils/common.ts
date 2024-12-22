import { AnyDocumentId, AutomergeUrl, DocHandle, interpretAsDocumentId, isValidAutomergeUrl } from "@automerge/automerge-repo";
import React, { useContext } from "react";
import PromiseCache from "./promisecache";

export type Id = AutomergeUrl;

export function isValidId(id: unknown): id is Id {
  return typeof id === 'string' && isValidAutomergeUrl(id);
}

export function asId(id: unknown) {
  if (id == null) {
    throw new Error("id is undefined or null");
  }

  return interpretAsDocumentId(id as AnyDocumentId);
}

export const DocHandleCacheContext = React.createContext<PromiseCache<Id, DocHandle<unknown>>>(new PromiseCache());

export function useDocHandleCache<V>() {
  return useContext(DocHandleCacheContext) as PromiseCache<Id, DocHandle<V>>;
}
