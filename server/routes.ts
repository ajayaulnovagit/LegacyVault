import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAssetSchema, insertNomineeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Asset routes
  app.get("/api/assets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assets = await storage.getUserAssets(userId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assetData = insertAssetSchema.parse({ ...req.body, userId });
      const asset = await storage.createAsset(assetData);
      res.json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Failed to create asset" });
    }
  });

  app.put("/api/assets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getAssetById(id);
      
      if (!asset || asset.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Asset not found" });
      }

      const assetData = insertAssetSchema.partial().parse(req.body);
      const updatedAsset = await storage.updateAsset(id, assetData);
      res.json(updatedAsset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getAssetById(id);
      
      if (!asset || asset.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Asset not found" });
      }

      await storage.deleteAsset(id);
      res.json({ message: "Asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Nominee routes
  app.get("/api/nominees", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const nominees = await storage.getUserNominees(userId);
      res.json(nominees);
    } catch (error) {
      console.error("Error fetching nominees:", error);
      res.status(500).json({ message: "Failed to fetch nominees" });
    }
  });

  app.post("/api/nominees", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const nomineeData = insertNomineeSchema.parse({ ...req.body, userId });
      const nominee = await storage.createNominee(nomineeData);
      res.json(nominee);
    } catch (error) {
      console.error("Error creating nominee:", error);
      res.status(400).json({ message: "Failed to create nominee" });
    }
  });

  app.put("/api/nominees/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const nominee = await storage.getNomineeById(id);
      
      if (!nominee || nominee.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Nominee not found" });
      }

      const nomineeData = insertNomineeSchema.partial().parse(req.body);
      const updatedNominee = await storage.updateNominee(id, nomineeData);
      res.json(updatedNominee);
    } catch (error) {
      console.error("Error updating nominee:", error);
      res.status(400).json({ message: "Failed to update nominee" });
    }
  });

  app.delete("/api/nominees/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const nominee = await storage.getNomineeById(id);
      
      if (!nominee || nominee.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Nominee not found" });
      }

      await storage.deleteNominee(id);
      res.json({ message: "Nominee deleted successfully" });
    } catch (error) {
      console.error("Error deleting nominee:", error);
      res.status(500).json({ message: "Failed to delete nominee" });
    }
  });

  // Well-being routes
  app.post("/api/wellbeing/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUserWellbeing(userId, {
        alertCounter: 0,
        lastCheckIn: new Date(),
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error confirming wellbeing:", error);
      res.status(500).json({ message: "Failed to confirm wellbeing" });
    }
  });

  app.put("/api/wellbeing/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { wellbeingFrequency, maxAlerts } = req.body;
      
      const updateData: Partial<any> = {};
      if (wellbeingFrequency !== undefined) updateData.wellbeingFrequency = wellbeingFrequency;
      if (maxAlerts !== undefined) updateData.maxAlerts = maxAlerts;
      
      const updatedUser = await storage.updateUserWellbeing(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating wellbeing settings:", error);
      res.status(500).json({ message: "Failed to update wellbeing settings" });
    }
  });

  // Storage preference routes
  app.put("/api/storage/preference", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { storagePreference } = req.body;
      
      if (!['gdrive', 'digilocker', 'local'].includes(storagePreference)) {
        return res.status(400).json({ message: "Invalid storage preference" });
      }
      
      const updatedUser = await storage.updateUserWellbeing(userId, { storagePreference });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating storage preference:", error);
      res.status(500).json({ message: "Failed to update storage preference" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      // Simple role check - in production you'd want proper role-based access control
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.email !== 'admin@secureestate.com') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getUsersWithAlerts();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      // Simple role check
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.email !== 'admin@secureestate.com') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getUsersWithAlerts();
      const activeUsers = users.filter(u => u.isActive).length;
      const pendingAlerts = users.filter(u => u.alertCounter > 0 && u.alertCounter < u.maxAlerts).length;
      const criticalAlerts = users.filter(u => u.alertCounter >= u.maxAlerts).length;
      const newSignups = users.filter(u => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return u.createdAt && u.createdAt > dayAgo;
      }).length;
      
      res.json({
        totalUsers: users.length,
        activeUsers,
        pendingAlerts,
        criticalAlerts,
        newSignups,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
