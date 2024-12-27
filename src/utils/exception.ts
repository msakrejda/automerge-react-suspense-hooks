import { AnyDocumentId } from "@automerge/automerge-repo";
import { toAutomergeUrl } from "./automerge";

export class DocumentDeletedException extends Error {
  public readonly id: AnyDocumentId;
  constructor(id: AnyDocumentId) {
    const docId = toAutomergeUrl(id);
    super(`document ${docId} was deleted`);
    this.id = id;
    this.name = this.constructor.name;
  }
}
