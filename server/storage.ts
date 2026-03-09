import { db } from "./db";
import {
  cars,
  bookings,
  reviews,
  type Car,
  type InsertCar,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";

export interface IStorage {
  getCars(type?: string): Promise<Car[]>;
  softDeleteCar(id: number): Promise<Car | undefined>;
  checkAvailability(carId: number, startDate: string, endDate: string): Promise<boolean>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  getReviews(carId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  createCar(car: InsertCar): Promise<Car>; // For seeding
}

export class DatabaseStorage implements IStorage {
  async getCars(type?: string): Promise<Car[]> {
    let query = db.select().from(cars).where(eq(cars.isAvailable, true));
    const allCars = await query;
    if (type) {
      return allCars.filter(c => c.type.toLowerCase() === type.toLowerCase());
    }
    return allCars;
  }

  async softDeleteCar(id: number): Promise<Car | undefined> {
    const [updated] = await db
      .update(cars)
      .set({ isAvailable: false })
      .where(eq(cars.id, id))
      .returning();
    return updated;
  }

  async checkAvailability(carId: number, startDate: string, endDate: string): Promise<boolean> {
    const overlappingBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.carId, carId),
        or(
          eq(bookings.status, "Pending"),
          eq(bookings.status, "Confirmed")
        ),
        // Используем явное приведение к типу DATE для PostgreSQL
        sql`CAST(${bookings.startDate} AS DATE) <= CAST(${endDate} AS DATE)`,
        sql`CAST(${bookings.endDate} AS DATE) >= CAST(${startDate} AS DATE)`
      )
    );
    return overlappingBookings.length === 0;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getReviews(carId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.carId, carId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }
}

export const storage = new DatabaseStorage();
