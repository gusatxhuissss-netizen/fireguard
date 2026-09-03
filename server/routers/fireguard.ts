import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storagePut } from "../storage";
import {
  createAlert,
  createFireIncident,
  createReport,
  ensureFireguardDemoData,
  getFireguardOverview,
  getReportsForUser,
  markAlertRead,
  updateDroneStatus,
  updateIncidentStatus,
  updateReportStatus,
  updateSensorStatus,
  updateUserProfile,
  updateUserRole,
} from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { calculateFireRisk } from "../risk";

const riskLevel = z.enum(["low", "medium", "high", "critical"]);
const reportStatus = z.enum(["received", "investigating", "resolved", "dismissed"]);
const role = z.enum(["user", "monitor", "admin"]);

const monitorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "monitor" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso permitido apenas para Monitor ou Admin." });
  }
  return next();
});

function parsePhoto(dataUrl?: string) {
  if (!dataUrl) return undefined;
  const [metadata, payload] = dataUrl.split(",");
  const type = metadata?.match(/data:(image\/[\w+.-]+);base64/)?.[1] ?? "image/jpeg";
  if (!payload) throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem inválida." });
  const extension = type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return { type, extension, buffer: Buffer.from(payload, "base64") };
}

export const fireguardRouter = router({
  overview: publicProcedure.query(async () => {
    await ensureFireguardDemoData();
    return getFireguardOverview();
  }),
  myReports: protectedProcedure.query(async ({ ctx }) => getReportsForUser(ctx.user.id)),
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().trim().min(2).max(120) }))
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input.name);
      return { success: true };
    }),
  markAlertRead: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await markAlertRead(input.id);
      return { success: true };
    }),
  riskAnalysis: publicProcedure
    .input(z.object({ temperature: z.number().min(-20).max(70), humidity: z.number().min(0).max(100), smoke: z.number().min(0).max(100), windSpeed: z.number().min(0).max(180) }))
    .query(({ input }) => calculateFireRisk(input)),
  createReport: protectedProcedure
    .input(z.object({ description: z.string().min(12).max(2000), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), riskLevel, photoDataUrl: z.string().max(4_500_000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const photo = parsePhoto(input.photoDataUrl);
      let photoKey: string | undefined;
      let photoUrl: string | undefined;
      if (photo) {
        const stored = await storagePut(`reports/${ctx.user.id}/${Date.now()}.${photo.extension}`, photo.buffer, photo.type);
        photoKey = stored.key;
        photoUrl = stored.url;
      }
      const report = await createReport({ reporterId: ctx.user.id, description: input.description, latitude: input.latitude, longitude: input.longitude, riskLevel: input.riskLevel, photoKey, photoUrl, status: "received" });
      await createAlert({ title: "Nova denúncia recebida", message: "Uma denúncia foi registrada e aguarda triagem pela equipe FireGuard.", severity: input.riskLevel === "critical" ? "critical" : "warning", isRead: false, isSimulated: false });
      return report;
    }),
  updateReportStatus: monitorProcedure
    .input(z.object({ id: z.number().int().positive(), status: reportStatus }))
    .mutation(async ({ input }) => {
      await updateReportStatus(input.id, input.status);
      return { success: true };
    }),
  updateIncidentStatus: monitorProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["active", "monitoring", "contained", "resolved"]) }))
    .mutation(async ({ input }) => {
      await updateIncidentStatus(input.id, input.status);
      return { success: true };
    }),
  updateSensorStatus: monitorProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["online", "alert", "maintenance", "offline"]) }))
    .mutation(async ({ input }) => {
      await updateSensorStatus(input.id, input.status);
      return { success: true };
    }),
  updateDroneStatus: monitorProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["patrolling", "investigating", "charging", "offline"]) }))
    .mutation(async ({ input }) => {
      await updateDroneStatus(input.id, input.status);
      return { success: true };
    }),
  simulateFire: publicProcedure.mutation(async () => {
    const now = Date.now();
    const incident = await createFireIncident({ title: "Ocorrência demonstrativa", riskLevel: "critical", status: "active", source: "simulation", latitude: -15.78 + (now % 100) / 10000, longitude: -47.89 - (now % 100) / 10000, temperature: 40, humidity: 14, smoke: 96, windSpeed: 34, isSimulated: true });
    await createAlert({ title: "Simulação: nova queimada", message: "Uma ocorrência crítica simulada foi adicionada aos painéis e ao mapa.", severity: "critical", incidentId: incident?.id, isRead: false, isSimulated: true });
    return incident;
  }),
  setUserRole: adminProcedure
    .input(z.object({ id: z.number().int().positive(), role }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.id, input.role);
      return { success: true };
    }),
});
