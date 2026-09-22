import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth/local";

describe("local password authentication", () => {
  it("hashes passwords without storing the original value", async () => {
    const password = "FireGuard123";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(hash).not.toContain(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("rejects an incorrect password and malformed hash", async () => {
    const hash = await hashPassword("FireGuard123");

    expect(await verifyPassword("OutraSenha123", hash)).toBe(false);
    expect(await verifyPassword("FireGuard123", "not-a-valid-hash")).toBe(false);
  });
});
