import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Simple JWT-like token (just base64 encoded for MVP)
function generateToken() {
  return Buffer.from(JSON.stringify({ admin: true, iat: Date.now() })).toString('base64');
}

function verifyToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded.admin === true;
  } catch {
    return false;
  }
}

// Middleware to protect admin routes
function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

async function seedDatabase() {
  try {
    const existingCars = await storage.getCars();
    console.log(`[Seed] Current cars in DB: ${existingCars.length}`);

    if (existingCars.length === 0) {
      console.log("[Seed] DB is empty, starting seeding...");
      const initialCars = [
        { model: "Toyota Corolla", type: "Economy", pricePerDay: 40, serialNumber: "ECO-1001", isAvailable: true },
        { model: "Honda Civic", type: "Economy", pricePerDay: 45, serialNumber: "ECO-1002", isAvailable: true },
        { model: "Ford Accord", type: "Comfort", pricePerDay: 65, serialNumber: "COM-2001", isAvailable: true },
        { model: "Volkswagen Passat", type: "Comfort", pricePerDay: 70, serialNumber: "COM-2002", isAvailable: true },
        { model: "Mercedes-Benz E-Class", type: "Luxury", pricePerDay: 120, serialNumber: "LUX-3001", isAvailable: true },
        { model: "BMW S-Class", type: "Luxury", pricePerDay: 150, serialNumber: "LUX-3002", isAvailable: true },
        { model: "Tesla Model S", type: "Luxury", pricePerDay: 180, serialNumber: "LUX-3003", isAvailable: true }
      ];

      for (const car of initialCars) {
        await storage.createCar(car);
        console.log(`[Seed] Inserted: ${car.model}`);
      }
      console.log("[Seed] Success! All cars inserted.");
    }
  } catch (err) {
    console.error("[Seed] Error during seeding:", err);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Call seed database once on startup
  seedDatabase().catch(console.error);

  // Auth endpoints
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      if (input.username === 'admin' && input.password === 'admin') {
        const token = generateToken();
        res.json({ success: true, token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get(api.cars.list.path, async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const cars = await storage.getCars(type);
      res.json(cars);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.cars.delete.path, adminAuthMiddleware, async (req, res) => {
    try {
      const carId = parseInt(String(req.params.id));
      const deletedCar = await storage.softDeleteCar(carId);
      if (!deletedCar) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(deletedCar);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.bookings.checkAvailability.path, /*adminAuthMiddleware,*/ async (req, res) => {
    try {
      const input = api.bookings.checkAvailability.input.parse(req.body);
      const isAvailable = await storage.checkAvailability(input.carId, input.startDate, input.endDate);
      res.json({ available: isAvailable });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      
      // Double check availability before booking
      const isAvailable = await storage.checkAvailability(input.carId, input.startDate, input.endDate);
      if (!isAvailable) {
        return res.status(400).json({ message: "Car is not available for these dates" });
      }

      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.bookings.listAdmin.path, adminAuthMiddleware, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.bookings.updateAdmin.path, adminAuthMiddleware, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const input = api.bookings.updateAdmin.input.parse(req.body);
      
      if (input.status) {
        const updatedBooking = await storage.updateBookingStatus(bookingId, input.status);
        if (!updatedBooking) {
          return res.status(404).json({ message: "Booking not found" });
        }
        return res.json(updatedBooking);
      }
      
      res.status(400).json({ message: "No status provided to update" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.reviews.list.path, async (req, res) => {
    try {
      const carId = parseInt(req.params.carId);
      const reviews = await storage.getReviews(carId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
