import { z } from 'zod';
import { insertCarSchema, insertBookingSchema, insertReviewSchema, cars, bookings, reviews } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/v1/auth/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), token: z.string() }),
        401: z.object({ message: z.string() }),
      }
    }
  },
  cars: {
    list: {
      method: 'GET' as const,
      path: '/api/v1/cars' as const,
      input: z.object({
        type: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof cars.$inferSelect>()),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/v1/admin/cars/:id' as const,
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  bookings: {
    checkAvailability: {
      method: 'POST' as const,
      path: '/api/v1/check-availability' as const,
      input: z.object({
        carId: z.coerce.number(),
        startDate: z.string(),
        endDate: z.string(),
      }),
      responses: {
        200: z.object({ available: z.boolean() }),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/v1/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    listAdmin: {
      method: 'GET' as const,
      path: '/api/v1/admin/bookings' as const,
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
      }
    },
    updateAdmin: {
      method: 'PATCH' as const,
      path: '/api/v1/admin/bookings/:id' as const,
      input: insertBookingSchema.partial().extend({ status: z.string().optional() }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/v1/cars/:carId/reviews' as const,
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/v1/reviews' as const,
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
