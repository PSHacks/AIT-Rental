import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  model: text("model").notNull(),
  type: text("type").notNull(), // Economy, Comfort, Luxury
  pricePerDay: integer("price_per_day").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull(),
  customerName: text("customer_name").notNull(),
  contactInfo: text("contact_info").notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(), // YYYY-MM-DD
  status: text("status").notNull().default("Pending"), // Pending, Confirmed, Cancelled
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull(),
  author: text("author").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
});

export const carsRelations = relations(cars, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  car: one(cars, {
    fields: [bookings.carId],
    references: [cars.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),
}));

export const insertCarSchema = createInsertSchema(cars).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, status: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true });

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
