import { pendingThenable, Thenable } from "./thenable";

type Status = "?" | "pending" | "fulfilled" | "rejected";

type Executor<K, V> = (
  key: K,
  resolve: (value: V) => void,
  reject: (e: Error) => void,
) => void;

export default class PromiseCache<Key, Value> {
  private thenables: Map<Key, Thenable<Value>>;

  constructor() {
    this.thenables = new Map<Key, Thenable<Value>>();
  }

  /**
   * Resolves the given key: if the key is not cached, it creates a promise with
   * the provided executor, stores the promise under the given key, and then
   * throws the promise.
   *
   * If the key is cached, the result depends on whether and how the associated
   * promise settled:
   *  - if the promise was fulfilled, the value will be returned
   *  - if the promise was rejected, its error is thrown to the caller
   *  - if the promise is still pending, it is thrown to the caller
   *
   * @param key
   * @param executor a pair of resolve and reject handlers passed to a promise
   * @returns the value once resolved
   * @throws an error if the promise was rejected
   * @throws a promise when the executor is initially started, or if still
   * pending
   */
  resolve(key: Key, executor: Executor<Key, Value>): Value {
    const thenable = this.thenables.get(key);

    if (!thenable) {
      const pending = pendingThenable<Value>();

      executor(key, pending.resolve, pending.reject);

      this.thenables.set(key, pending);
      throw pending;
    }

    if (thenable.status === "rejected") {
      throw new Error(`promise was rejected: ${thenable.reason}`);
    }

    if (thenable.status === "pending") {
      throw thenable;
    }

    return thenable.value;
  }

  resolveAll(keys: Key[], executor: Executor<Key, Value>): Value[] {
    const missing = keys.filter((k) => !this.thenables.has(k));
    if (missing.length > 0) {
      missing.forEach((k) => {
        const p = pendingThenable<Value>();
        executor(k, p.resolve, p.reject);
        this.thenables.set(k, p);
      });
    }
    const thenables = keys.map((k) => this.thenables.get(k));
    const pending = thenables.filter((t) => t?.status === "pending");
    if (pending.length == 1) {
      throw thenables.at(0);
    }
    if (pending.length > 1) {
      const p = pendingThenable<Value[]>();
      Promise.all(pending).then(p.resolve).catch(p.reject);
      throw p;
    }
    const rejected = thenables.filter((t) => t?.status === "rejected");
    if (rejected.length > 0) {
      const reasons = rejected.map((r) => r.reason);
      throw new Error("one or more promises was rejected", { cause: reasons });
    }

    const fulfilled = thenables.filter((t) => t?.status === "fulfilled");
    if (fulfilled.length < keys.length) {
      throw new Error("unknown promise statuses");
    }

    return fulfilled.map((t) => t.value);
  }

  /**
   * The status of this key's associated promise, or "?" if the key is not found.
   * @param key
   * @returns status
   */
  status(key: Key): Status {
    const thenable = this.thenables.get(key);
    if (!thenable) {
      return "?";
    }
    return thenable?.status;
  }

  /**
   * Forget the promise for the given key.
   * @param key
   */
  forget(key: Key) {
    this.thenables.delete(key);
  }
}
