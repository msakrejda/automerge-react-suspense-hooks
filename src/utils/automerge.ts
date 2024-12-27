import {
  AnyDocumentId,
  interpretAsDocumentId,
  stringifyAutomergeUrl,
} from "@automerge/automerge-repo";

export function toAutomergeUrl(id: AnyDocumentId) {
  return stringifyAutomergeUrl(interpretAsDocumentId(id));
}
