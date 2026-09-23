import { describe, expect, it } from "vitest";
import { buildLocalUserInsert } from "./db";

describe("local user registration mapping", () => {
  it("maps every registration field to the users insert without a plaintext password", () => {
    const passwordHash = "scrypt$16384$8$1$salt$derived-key";
    const values = buildLocalUserInsert({
      openId: "email:abc123",
      name: "Ana Souza",
      companyName: "FireGuard Ltda",
      email: "ana@example.com",
      passwordHash,
      birthDate: "1990-05-20",
      phone: "11999999999",
    });

    expect(values).toMatchObject({
      openId: "email:abc123",
      name: "Ana Souza",
      companyName: "FireGuard Ltda",
      email: "ana@example.com",
      passwordHash,
      birthDate: "1990-05-20",
      phone: "11999999999",
      loginMethod: "email",
      role: "user",
    });
    expect(values).not.toHaveProperty("id");
    expect(values).not.toHaveProperty("createdAt");
    expect(values).not.toHaveProperty("updatedAt");
    expect(values.passwordHash).not.toContain("FireGuard123");
    expect(values.lastSignedIn).toBeInstanceOf(Date);
  });
});
