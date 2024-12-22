import { AutomergeUrl } from "@automerge/automerge-repo";

export class DocumentDeletedException extends Error {
  public readonly url: AutomergeUrl;
  constructor(url: AutomergeUrl) {
    super(`document ${url} was deleted`);
    this.url = url;
    this.name = this.constructor.name;
  }
}

export class AssertionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function assert(assertion: boolean | (() => boolean), message: string): void {
  const result = typeof assertion === 'boolean' ? assertion : assertion();
  if (!result) {
    throw new AssertionException(message);
  }
}