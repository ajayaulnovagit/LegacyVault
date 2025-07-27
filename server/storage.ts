import {
  users,
  assets,
  nominees,
  wellbeingAlerts,
  emergencyNotifications,
  type User,
  type UpsertUser,
  type Asset,
  type InsertAsset,
  type Nominee,
  type InsertNominee,
  type WellbeingAlert,
  type InsertWellbeingAlert,
  type EmergencyNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserWellbeing(userId: string, data: Partial<User>): Promise<User>;
  
  // Asset operations
  getUserAssets(userId: string): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
  getAssetById(id: string): Promise<Asset | undefined>;
  
  // Nominee operations
  getUserNominees(userId: string): Promise<Nominee[]>;
  createNominee(nominee: InsertNominee): Promise<Nominee>;
  updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<Nominee>;
  deleteNominee(id: string): Promise<void>;
  getNomineeById(id: string): Promise<Nominee | undefined>;
  
  // Wellbeing operations
  getUserWellbeingAlerts(userId: string): Promise<WellbeingAlert[]>;
  createWellbeingAlert(alert: InsertWellbeingAlert): Promise<WellbeingAlert>;
  updateWellbeingAlert(id: string, alert: Partial<InsertWellbeingAlert>): Promise<WellbeingAlert>;
  
  // Emergency operations
  createEmergencyNotification(userId: string, nomineeId: string): Promise<EmergencyNotification>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUsersWithAlerts(): Promise<(User & { alertCount: number })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserWellbeing(userId: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Asset operations
  async getUserAssets(userId: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId)).orderBy(desc(assets.createdAt));
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  // Nominee operations
  async getUserNominees(userId: string): Promise<Nominee[]> {
    return await db.select().from(nominees).where(eq(nominees.userId, userId)).orderBy(desc(nominees.isPrimary));
  }

  async createNominee(nominee: InsertNominee): Promise<Nominee> {
    const [newNominee] = await db.insert(nominees).values(nominee).returning();
    return newNominee;
  }

  async updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<Nominee> {
    const [updatedNominee] = await db
      .update(nominees)
      .set({ ...nominee, updatedAt: new Date() })
      .where(eq(nominees.id, id))
      .returning();
    return updatedNominee;
  }

  async deleteNominee(id: string): Promise<void> {
    await db.delete(nominees).where(eq(nominees.id, id));
  }

  async getNomineeById(id: string): Promise<Nominee | undefined> {
    const [nominee] = await db.select().from(nominees).where(eq(nominees.id, id));
    return nominee;
  }

  // Wellbeing operations
  async getUserWellbeingAlerts(userId: string): Promise<WellbeingAlert[]> {
    return await db.select().from(wellbeingAlerts).where(eq(wellbeingAlerts.userId, userId)).orderBy(desc(wellbeingAlerts.createdAt));
  }

  async createWellbeingAlert(alert: InsertWellbeingAlert): Promise<WellbeingAlert> {
    const [newAlert] = await db.insert(wellbeingAlerts).values(alert).returning();
    return newAlert;
  }

  async updateWellbeingAlert(id: string, alert: Partial<InsertWellbeingAlert>): Promise<WellbeingAlert> {
    const [updatedAlert] = await db
      .update(wellbeingAlerts)
      .set({ ...alert, updatedAt: new Date() })
      .where(eq(wellbeingAlerts.id, id))
      .returning();
    return updatedAlert;
  }

  // Emergency operations
  async createEmergencyNotification(userId: string, nomineeId: string): Promise<EmergencyNotification> {
    const [notification] = await db
      .insert(emergencyNotifications)
      .values({ userId, nomineeId })
      .returning();
    return notification;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersWithAlerts(): Promise<(User & { alertCount: number })[]> {
    const usersWithAlerts = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        wellbeingFrequency: users.wellbeingFrequency,
        alertCounter: users.alertCounter,
        maxAlerts: users.maxAlerts,
        lastCheckIn: users.lastCheckIn,
        isActive: users.isActive,
        storagePreference: users.storagePreference,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        alertCount: users.alertCounter,
      })
      .from(users)
      .orderBy(desc(users.alertCounter), desc(users.updatedAt));
    
    return usersWithAlerts;
  }
}

export const storage = new DatabaseStorage();
