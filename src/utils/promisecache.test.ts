import { describe, expect, it } from "vitest";
import PromiseCache from "./promisecache";
import { Thenable } from "./thenable";

describe("PromiseCache", () => {
  describe("resolve", () => {
    it("throws a promise if the value for the given key is not cached", () => {
      const cache = new PromiseCache<string, string>();

      let promise: Thenable<string> | undefined = undefined;
      try {
        cache.resolve("hello", () => {});
      } catch (p) {
        promise = p as Thenable<string>;
      }

      expect(promise).toBeDefined();
      expect(promise?.status).toEqual("pending");
    });

    it("returns the resolved value if the executor for the given key resolves", () => {
      const cache = new PromiseCache<string, string>();

      const resolved = cache.resolve("hello", (_key, resolve) =>
        resolve("world"),
      );

      expect(resolved).toEqual("world");
    });

    it("returns the resolved value if the executor for the given key resolves asynchronously", async () => {
      const cache = new PromiseCache<string, string>();
      function executor(_key: string, resolve: (value: string) => void) {
        setTimeout(() => resolve("world"), 1);
      }

      let promise: Thenable<string> | undefined = undefined;
      try {
        cache.resolve("hello", executor);
      } catch (p) {
        promise = p as Thenable<string>;
      }

      expect(promise).toBeDefined();

      await promise;

      const result = cache.resolve("hello", executor);
      expect(result).toEqual("world");
    });

    it("throw the rejection error value if the executor for the given key rejectes", () => {
      const cache = new PromiseCache<string, string>();

      let err: Error | undefined = undefined;
      try {
        cache.resolve("hello", (_key, _resolve, reject) =>
          reject(new Error("oh snap")),
        );
      } catch (e) {
        err = e as Error;
      }

      expect(err?.message).toEqual("promise was rejected: Error: oh snap");
    });

    it("throw the rejection error value if the executor for the given key rejects asynchronously", async () => {
      const cache = new PromiseCache<string, string>();
      function executor(
        _key: string,
        _resolve: unknown,
        reject: (e: Error) => void,
      ) {
        setTimeout(() => reject(new Error("oh snap")), 1);
      }

      let promise: Thenable<string> | undefined = undefined;
      try {
        cache.resolve("hello", executor);
      } catch (p) {
        promise = p as Thenable<string>;
      }

      expect(promise).toBeDefined();

      let err: Error | undefined = undefined;
      try {
        await promise;
      } catch (e) {
        err = e as Error;
      }
      expect(err).toBeDefined();
      expect(err?.message).toEqual("oh snap");
    });
  });
});
