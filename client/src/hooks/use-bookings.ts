import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertBooking } from "@shared/routes";

export function useCheckAvailability(token?: string | null) {
  return useMutation({
    mutationFn: async (data: { carId: number; startDate: string; endDate: string }) => {
      const validated = api.bookings.checkAvailability.input.parse(data);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(api.bookings.checkAvailability.path, {
        method: api.bookings.checkAvailability.method,
        headers,
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to check availability");
      
      const responseData = await res.json();
      return api.bookings.checkAvailability.responses[200].parse(responseData);
    }
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertBooking) => {
      const validated = api.bookings.create.input.parse(data);
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create booking");
      }
      
      const responseData = await res.json();
      return api.bookings.create.responses[201].parse(responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.listAdmin.path] });
    }
  });
}

export function useAdminBookings(token?: string | null) {
  return useQuery({
    queryKey: [api.bookings.listAdmin.path, token],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(api.bookings.listAdmin.path, { 
        credentials: "include",
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      
      const data = await res.json();
      return api.bookings.listAdmin.responses[200].parse(data);
    }
  });
}

export function useUpdateBooking(token?: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.bookings.updateAdmin.path, { id });
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(url, {
        method: api.bookings.updateAdmin.method,
        headers,
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update booking status");
      
      const data = await res.json();
      return api.bookings.updateAdmin.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.listAdmin.path] });
    }
  });
}
