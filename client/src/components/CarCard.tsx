import { type Car } from "@shared/routes";
import { Calendar, Star, Users, Briefcase } from "lucide-react";

interface CarCardProps {
  car: Car;
  onBook: (car: Car) => void;
  onReviews: (car: Car) => void;
}

export function CarCard({ car, onBook, onReviews }: CarCardProps) {
  return (
    <div className="group bg-card rounded-2xl border border-border/60 clean-shadow flex flex-col overflow-hidden relative">
      {!car.isAvailable && (
        <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
          Unavailable
        </div>
      )}
      
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground mb-3">
              {car.type}
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
              {car.model}
            </h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              SN: {car.serialNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Abstract sleek visual representation instead of missing images */}
      <div className="my-6 px-6 relative h-32 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/50 to-transparent rounded-r-3xl mr-12 mix-blend-multiply" />
        <Briefcase className="w-24 h-24 text-border/40 group-hover:text-primary/10 transition-colors duration-500 absolute right-6" />
        <div className="w-full flex justify-between items-end relative z-10">
          <div className="flex flex-col">
            <span className="text-4xl font-display font-bold">${car.pricePerDay}</span>
            <span className="text-sm text-muted-foreground">per day</span>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 pt-0 flex gap-3">
        <button
          onClick={() => onBook(car)}
          disabled={!car.isAvailable}
          className="flex-1 bg-primary text-primary-foreground rounded-xl py-3.5 font-medium text-sm shadow-lg shadow-primary/10 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          Book Now
        </button>
        <button
          onClick={() => onReviews(car)}
          className="w-14 flex items-center justify-center bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"
          title="View Reviews"
        >
          <Star className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
