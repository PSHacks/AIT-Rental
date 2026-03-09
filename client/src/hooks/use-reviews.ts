import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertReview } from "@shared/routes";

export function useReviews(carId: number) {
  return useQuery({
    queryKey: [buildUrl(api.reviews.list.path, { carId })],
    queryFn: async () => {
      const url = buildUrl(api.reviews.list.path, { carId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      
      const data = await res.json();
      return api.reviews.list.responses[200].parse(data);
    },
    enabled: !!carId
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertReview) => {
      const validated = api.reviews.create.input.parse(data);
      const res = await fetch(api.reviews.create.path, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create review");
      
      const responseData = await res.json();
      return api.reviews.create.responses[201].parse(responseData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [buildUrl(api.reviews.list.path, { carId: variables.carId })] 
      });
    }
  });
}
