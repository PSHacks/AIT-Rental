import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useCars(type?: string, token?: string | null) {
  return useQuery({
    queryKey: [api.cars.list.path, type, token],
    queryFn: async () => {
      const url = new URL(api.cars.list.path, window.location.origin);
      if (type && type !== "All") {
        url.searchParams.append("type", type);
      }
      
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(url.toString(), { 
        credentials: "include",
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch cars");
      
      const data = await res.json();
      return api.cars.list.responses[200].parse(data);
    },
  });
}

export function useDeleteCar(token?: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cars.delete.path, { id });
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(url, {
        method: api.cars.delete.method,
        credentials: "include",
        headers,
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Car not found");
        throw new Error("Failed to delete car");
      }
      
      const data = await res.json();
      return api.cars.delete.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
    }
  });
}
