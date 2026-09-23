import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  createAlert: vi.fn(),
  createFireIncident: vi.fn(),
  createReport: vi.fn(),
  ensureFireguardDemoData: vi.fn(),
  getFireguardOverview: vi.fn(),
  getReportsForUser: vi.fn(),
  markAlertRead: vi.fn(),
  updateDroneStatus: vi.fn(),
  updateIncidentStatus: vi.fn(),
  updateReportStatus: vi.fn(),
  updateSensorStatus: vi.fn(),
  updateUserProfile: vi.fn(),
  updateUserRole: vi.fn(),
}));

vi.mock("./db", () => dbMock);
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "user" | "monitor" | "admin" = "user"): TrpcContext {
  return { user: { id: 12, openId: "test-user", name: "Teste", email: "test@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("mutações principais do FireGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.createFireIncident.mockResolvedValue({ id: 44 });
    dbMock.createReport.mockResolvedValue({ id: 53 });
  });

  it("cria uma denúncia vinculada à pessoa autenticada", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.fireguard.createReport({ description: "Há uma coluna de fumaça próxima à entrada da reserva.", latitude: -15.79, longitude: -47.88, riskLevel: "high" });
    expect(result).toEqual({ id: 53 });
    expect(dbMock.createReport).toHaveBeenCalledWith(expect.objectContaining({ reporterId: 12, riskLevel: "high", status: "received" }));
    expect(dbMock.createAlert).toHaveBeenCalledWith(expect.objectContaining({ title: "Nova denúncia recebida", isSimulated: false }));
  });

  it("cria uma queimada simulada e o respectivo alerta", async () => {
    const caller = appRouter.createCaller(context());
    await caller.fireguard.simulateFire();
    expect(dbMock.createFireIncident).toHaveBeenCalledWith(expect.objectContaining({ title: "Ocorrência demonstrativa · Rio Branco", riskLevel: "critical", isSimulated: true }));
    expect(dbMock.createAlert).toHaveBeenCalledWith(expect.objectContaining({ title: "Simulação: nova queimada", incidentId: 44 }));
  });

  it("persiste a leitura de um alerta e a atualização do perfil", async () => {
    const caller = appRouter.createCaller(context());
    await caller.fireguard.markAlertRead({ id: 7 });
    await caller.fireguard.updateProfile({ name: "Ana Silva" });
    expect(dbMock.markAlertRead).toHaveBeenCalledWith(7);
    expect(dbMock.updateUserProfile).toHaveBeenCalledWith(12, "Ana Silva");
  });

  it("permite que Admin atualize os ativos e os papéis da operação", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await caller.fireguard.updateIncidentStatus({ id: 2, status: "contained" });
    await caller.fireguard.updateSensorStatus({ id: 3, status: "maintenance" });
    await caller.fireguard.updateDroneStatus({ id: 4, status: "charging" });
    await caller.fireguard.setUserRole({ id: 5, role: "monitor" });
    expect(dbMock.updateIncidentStatus).toHaveBeenCalledWith(2, "contained");
    expect(dbMock.updateSensorStatus).toHaveBeenCalledWith(3, "maintenance");
    expect(dbMock.updateDroneStatus).toHaveBeenCalledWith(4, "charging");
    expect(dbMock.updateUserRole).toHaveBeenCalledWith(5, "monitor");
  });
});
