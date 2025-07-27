import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  wellbeingFrequency: integer("wellbeing_frequency").default(24), // hours
  alertCounter: integer("alert_counter").default(0),
  maxAlerts: integer("max_alerts").default(3),
  lastCheckIn: timestamp("last_check_in").defaultNow(),
  isActive: boolean("is_active").default(true),
  storagePreference: varchar("storage_preference").default('local'), // 'gdrive', 'digilocker', 'local'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assetTypeEnum = pgEnum('asset_type', [
  'bank_account',
  'fixed_deposit', 
  'property',
  'investment',
  'cryptocurrency',
  'loan_given',
  'insurance',
  'other'
]);

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: assetTypeEnum("type").notNull(),
  name: varchar("name").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  accountNumber: varchar("account_number"),
  description: text("description"),
  storageLocation: varchar("storage_location").notNull().default('local'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nominees = pgTable("nominees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  relationship: varchar("relationship").notNull(),
  isPrimary: boolean("is_primary").default(false),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellbeingAlerts = pgTable("wellbeing_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  alertCount: integer("alert_count").default(0),
  lastAlertSent: timestamp("last_alert_sent"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emergencyNotifications = pgTable("emergency_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  nomineeId: varchar("nominee_id").notNull().references(() => nominees.id, { onDelete: 'cascade' }),
  sentAt: timestamp("sent_at").defaultNow(),
  status: varchar("status").default('sent'), // 'sent', 'delivered', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  assets: many(assets),
  nominees: many(nominees),
  wellbeingAlerts: many(wellbeingAlerts),
  emergencyNotifications: many(emergencyNotifications),
}));

export const assetRelations = relations(assets, ({ one }) => ({
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
}));

export const nomineeRelations = relations(nominees, ({ one, many }) => ({
  user: one(users, {
    fields: [nominees.userId],
    references: [users.id],
  }),
  emergencyNotifications: many(emergencyNotifications),
}));

export const wellbeingAlertRelations = relations(wellbeingAlerts, ({ one }) => ({
  user: one(users, {
    fields: [wellbeingAlerts.userId],
    references: [users.id],
  }),
}));

export const emergencyNotificationRelations = relations(emergencyNotifications, ({ one }) => ({
  user: one(users, {
    fields: [emergencyNotifications.userId],
    references: [users.id],
  }),
  nominee: one(nominees, {
    fields: [emergencyNotifications.nomineeId],
    references: [nominees.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNomineeSchema = createInsertSchema(nominees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWellbeingAlertSchema = createInsertSchema(wellbeingAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertNominee = z.infer<typeof insertNomineeSchema>;
export type Nominee = typeof nominees.$inferSelect;
export type InsertWellbeingAlert = z.infer<typeof insertWellbeingAlertSchema>;
export type WellbeingAlert = typeof wellbeingAlerts.$inferSelect;
export type EmergencyNotification = typeof emergencyNotifications.$inferSelect;
