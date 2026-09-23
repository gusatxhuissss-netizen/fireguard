import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  alerts,
  drones,
  fireIncidents,
  InsertUser,
  reports,
  sensors,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    lastSignedIn: user.lastSignedIn ?? new Date(),
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
  };
  await db.insert(users).values(values).onDuplicateKeyUpdate({
    set: {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: new Date(),
    },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export type LocalUserData = {
  openId: string;
  name: string;
  companyName: string;
  email: string;
  passwordHash: string;
  birthDate: string;
  phone: string;
};

export function buildLocalUserInsert(data: LocalUserData) {
  return {
    openId: data.openId,
    name: data.name,
    companyName: data.companyName,
    email: data.email,
    passwordHash: data.passwordHash,
    birthDate: data.birthDate,
    phone: data.phone,
    loginMethod: "email" as const,
    role: "user" as const,
    lastSignedIn: new Date(),
  };
}

export async function createLocalUser(data: LocalUserData) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(users).values(buildLocalUserInsert(data));
  return getUserByOpenId(data.openId);
}

export async function updateUserLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function ensureFireguardDemoData() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: fireIncidents.id }).from(fireIncidents).limit(1);
  if (existing.length) return;

  await db.insert(fireIncidents).values([
    { title: "Reserva Extrativista Chico Mendes · Xapuri", riskLevel: "critical", status: "active", source: "simulation", latitude: -10.6516, longitude: -68.5044, temperature: 39, humidity: 15, smoke: 94, windSpeed: 31, isSimulated: true },
    { title: "Zona rural de Rio Branco", riskLevel: "high", status: "monitoring", source: "sensor", latitude: -9.9754, longitude: -67.8249, temperature: 35, humidity: 22, smoke: 68, windSpeed: 21, isSimulated: true },
    { title: "Floresta Estadual do Antimary", riskLevel: "medium", status: "monitoring", source: "drone", latitude: -9.3333, longitude: -68.1833, temperature: 30, humidity: 34, smoke: 36, windSpeed: 13, isSimulated: true },
    { title: "Parque Nacional da Serra do Divisor", riskLevel: "low", status: "contained", source: "simulation", latitude: -7.45, longitude: -73.66, temperature: 25, humidity: 61, smoke: 12, windSpeed: 7, isSimulated: true },
  ]);
  await db.insert(sensors).values([
    { name: "FG-SEN-014", location: "Reserva Chico Mendes · Xapuri", status: "alert", latitude: -10.6516, longitude: -68.5044, temperature: 39, humidity: 15, smoke: 94, windSpeed: 31, isSimulated: true },
    { name: "FG-SEN-021", location: "Rio Branco · zona rural", status: "online", latitude: -9.9754, longitude: -67.8249, temperature: 35, humidity: 22, smoke: 68, windSpeed: 21, isSimulated: true },
    { name: "FG-SEN-008", location: "Floresta do Antimary", status: "online", latitude: -9.3333, longitude: -68.1833, temperature: 30, humidity: 34, smoke: 36, windSpeed: 13, isSimulated: true },
  ]);
  await db.insert(drones).values([
    { name: "Águia 01", area: "Xapuri · Reserva Chico Mendes", status: "investigating", battery: 72, latitude: -10.6516, longitude: -68.5044, lastFlightAt: new Date(), isSimulated: true },
    { name: "Águia 02", area: "Rio Branco · zona rural", status: "patrolling", battery: 88, latitude: -9.9754, longitude: -67.8249, lastFlightAt: new Date(), isSimulated: true },
    { name: "Águia 03", area: "Antimary · setor florestal", status: "charging", battery: 34, latitude: -9.3333, longitude: -68.1833, lastFlightAt: new Date(), isSimulated: true },
  ]);
  await db.insert(alerts).values([
    { title: "Risco crítico detectado", message: "Leituras simuladas de fumaça e temperatura exigem atenção na Reserva Chico Mendes, em Xapuri.", severity: "critical", isRead: false, isSimulated: true },
    { title: "Drone em rota de verificação", message: "Águia 01 está investigando a região de Xapuri com telemetria simulada.", severity: "warning", isRead: false, isSimulated: true },
  ]);
}

export async function getFireguardOverview() {
  const db = await getDb();
  if (!db) return { incidents: [], reports: [], alerts: [], sensors: [], drones: [], users: [] };
  const [incidentRows, reportRows, alertRows, sensorRows, droneRows, userRows] = await Promise.all([
    db.select().from(fireIncidents).orderBy(desc(fireIncidents.createdAt)),
    db.select().from(reports).orderBy(desc(reports.createdAt)),
    db.select().from(alerts).orderBy(desc(alerts.createdAt)),
    db.select().from(sensors).orderBy(desc(sensors.updatedAt)),
    db.select().from(drones).orderBy(desc(drones.updatedAt)),
    db.select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      companyName: users.companyName,
      email: users.email,
      loginMethod: users.loginMethod,
      birthDate: users.birthDate,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastSignedIn: users.lastSignedIn,
    }).from(users).orderBy(desc(users.createdAt)),
  ]);
  return { incidents: incidentRows, reports: reportRows, alerts: alertRows, sensors: sensorRows, drones: droneRows, users: userRows };
}

export async function createFireIncident(data: typeof fireIncidents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(fireIncidents).values(data);
  const [incident] = await db.select().from(fireIncidents).orderBy(desc(fireIncidents.id)).limit(1);
  return incident;
}

export async function createAlert(data: typeof alerts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(alerts).values(data);
}

export async function createReport(data: typeof reports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(reports).values(data);
  const [report] = await db.select().from(reports).orderBy(desc(reports.id)).limit(1);
  return report;
}

export async function updateReportStatus(id: number, status: "received" | "investigating" | "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(reports).set({ status }).where(eq(reports.id, id));
}

export async function updateIncidentStatus(id: number, status: "active" | "monitoring" | "contained" | "resolved") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(fireIncidents).set({ status }).where(eq(fireIncidents.id, id));
}

export async function updateSensorStatus(id: number, status: "online" | "alert" | "maintenance" | "offline") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(sensors).set({ status }).where(eq(sensors.id, id));
}

export async function updateDroneStatus(id: number, status: "patrolling" | "investigating" | "charging" | "offline") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(drones).set({ status }).where(eq(drones.id, id));
}

export async function updateUserRole(id: number, role: "user" | "monitor" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function updateUserProfile(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(users).set({ name }).where(eq(users.id, id));
}

export async function getReportsForUser(reporterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.reporterId, reporterId)).orderBy(desc(reports.createdAt));
}

export async function markAlertRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
}
