import { describe, it, expect } from "vitest";
import { createRateLimiter } from "../../../api/_lib/rateLimit";

describe("createRateLimiter", () => {
  it("allows up to the limit and then blocks", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 1000, now: () => 0 });
    expect(check("a").allowed).toBe(true);
    expect(check("a").allowed).toBe(true);
    const third = check("a");
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
    expect(check("a").allowed).toBe(false);
  });

  it("reports Retry-After rounded up to whole seconds", () => {
    let t = 0;
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => t });
    check("a");
    t = 10_500;
    expect(check("a").retryAfterSec).toBe(50);
  });

  it("resets after the window elapses", () => {
    let t = 0;
    const check = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    check("a");
    expect(check("a").allowed).toBe(false);
    t = 1000;
    expect(check("a").allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
    check("a");
    expect(check("a").allowed).toBe(false);
    expect(check("b").allowed).toBe(true);
  });

  it("evicts old keys so memory stays bounded", () => {
    let t = 0;
    const check = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 3, now: () => t });
    ["a", "b", "c"].forEach(check);
    t = 2000; // all expired
    expect(check("d").allowed).toBe(true);
    expect(check("a").allowed).toBe(true); // was pruned, starts fresh
  });
});
