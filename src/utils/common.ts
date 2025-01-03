import {
  AnyDocumentId,
  AutomergeUrl,
  DocHandle,
  interpretAsDocumentId,
  isValidAutomergeUrl,
} from "@automerge/automerge-repo";
import React, { useContext } from "react";
import PromiseCache from "./promisecache";

export function isValidId(id: unknown): id is AutomergeUrl {
  return typeof id === "string" && isValidAutomergeUrl(id);
}

export function asId(id: unknown) {
  if (id == null) {
    throw new Error("id is undefined or null");
  }

  return interpretAsDocumentId(id as AnyDocumentId);
}

export const DocHandleCacheContext = React.createContext<
  PromiseCache<AutomergeUrl, DocHandle<unknown>>
>(new PromiseCache());

export function useDocHandleCache<V>() {
  return useContext(DocHandleCacheContext) as PromiseCache<
    AutomergeUrl,
    DocHandle<V>
  >;
}
