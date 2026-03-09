import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { BookingModal } from "@/components/BookingModal";
import { ReviewsModal } from "@/components/ReviewsModal";
import { useCars } from "@/hooks/use-cars";
import { type Car } from "@shared/routes";
import { Loader2 } from "lucide-react";

const TYPES = ["All", "Economy", "Comfort", "Luxury"];

export function HomePage() {
  const [activeType, setActiveType] = useState("All");
  const { data: cars, isLoading } = useCars(activeType);
  
  const [bookingCar, setBookingCar] = useState<Car | null>(null);
  const [reviewsCar, setReviewsCar] = useState<Car | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-8">
          Premium Car Rental
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          Drive in <span className="text-muted-foreground">elegance.</span><br/>
          Arrive in style.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the perfect blend of performance, luxury, and comfort. 
          Choose from our curated fleet for your next journey.
        </p>
      </section>

      {/* Filter & Grid Section */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeType === type 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !cars?.length ? (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <p className="text-lg text-muted-foreground">No vehicles available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <CarCard 
                key={car.id} 
                car={car} 
                onBook={setBookingCar}
                onReviews={setReviewsCar}
              />
            ))}
          </div>
        )}
      </section>

      <BookingModal 
        car={bookingCar} 
        isOpen={!!bookingCar} 
        onClose={() => setBookingCar(null)} 
      />
      <ReviewsModal 
        car={reviewsCar} 
        isOpen={!!reviewsCar} 
        onClose={() => setReviewsCar(null)} 
      />
    </div>
  );
}
