export class AssertionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function assert(
  assertion: boolean | (() => boolean),
  message: string,
): void {
  const result = typeof assertion === "boolean" ? assertion : assertion();
  if (!result) {
    throw new AssertionException(message);
  }
}
