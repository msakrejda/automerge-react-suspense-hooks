import { describe, expect, it } from "vitest";

import { FulfilledThenable, pendingThenable, RejectedThenable } from "./thenable";

describe("Thenable", () => {
  describe("pendingThenable", () => {
    it("creates a pending Thenable", () => {
      const t = pendingThenable<number>();
      expect(t.status).toEqual("pending");
    });

    it("becomes a FullfilledThenable when resolved", () => {
      const t = pendingThenable<number>();
      t.resolve(42);
      expect(t.status).toEqual("fulfilled");
      expect((t as unknown as FulfilledThenable<number>).value).toEqual(42);
    });

    it("becomes a RejectedThenable when rejected", () => {
      const t = pendingThenable<number>();
      const err = new Error("oh snap");
      t.reject(err);
      expect(t.status).toEqual("rejected");
      expect((t as unknown as RejectedThenable<Error>).reason).toEqual(err);
    });
  });
});
