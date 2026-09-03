import {
  boolean,
  double,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "monitor", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const fireIncidents = mysqlTable("fireIncidents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).notNull(),
  status: mysqlEnum("status", ["active", "monitoring", "contained", "resolved"]).default("active").notNull(),
  source: mysqlEnum("source", ["sensor", "drone", "report", "simulation"]).default("simulation").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  temperature: double("temperature").notNull(),
  humidity: double("humidity").notNull(),
  smoke: double("smoke").notNull(),
  windSpeed: double("windSpeed").notNull(),
  isSimulated: boolean("isSimulated").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId"),
  description: text("description").notNull(),
  photoKey: varchar("photoKey", { length: 500 }),
  photoUrl: varchar("photoUrl", { length: 500 }),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["received", "investigating", "resolved", "dismissed"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "danger", "critical"]).default("info").notNull(),
  incidentId: int("incidentId"),
  isRead: boolean("isRead").default(false).notNull(),
  isSimulated: boolean("isSimulated").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const sensors = mysqlTable("sensors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["online", "alert", "maintenance", "offline"]).default("online").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  temperature: double("temperature").notNull(),
  humidity: double("humidity").notNull(),
  smoke: double("smoke").notNull(),
  windSpeed: double("windSpeed").notNull(),
  isSimulated: boolean("isSimulated").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const drones = mysqlTable("drones", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  area: varchar("area", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["patrolling", "investigating", "charging", "offline"]).default("patrolling").notNull(),
  battery: int("battery").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  lastFlightAt: timestamp("lastFlightAt").defaultNow().notNull(),
  isSimulated: boolean("isSimulated").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type FireIncident = typeof fireIncidents.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Sensor = typeof sensors.$inferSelect;
export type Drone = typeof drones.$inferSelect;
