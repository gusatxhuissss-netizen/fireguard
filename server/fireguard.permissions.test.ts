import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "monitor" | "admin"): TrpcContext {
  return {
    user: {
      id: 77,
      openId: `role-${role}`,
      name: role,
      email: null,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("papéis do FireGuard", () => {
  it("impede que Usuário atualize uma denúncia", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.fireguard.updateReportStatus({ id: 1, status: "resolved" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("impede que Monitor altere papéis de acesso", async () => {
    const caller = appRouter.createCaller(contextFor("monitor"));
    await expect(caller.fireguard.setUserRole({ id: 1, role: "admin" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
