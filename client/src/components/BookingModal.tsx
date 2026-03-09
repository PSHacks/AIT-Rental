import { useState } from "react";
import { X, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { type Car } from "@shared/routes";
import { useCheckAvailability, useCreateBooking } from "@/hooks/use-bookings";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ car, isOpen, onClose }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { toast } = useToast();
  const checkAvailability = useCheckAvailability();
  const createBooking = useCreateBooking();

  if (!isOpen || !car) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!startDate || !endDate || !customerName || !contactInfo) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg("End date must be after start date.");
      return;
    }

    try {
      // 1. Check availability
      const availability = await checkAvailability.mutateAsync({
        carId: car.id,
        startDate,
        endDate
      });

      if (!availability.available) {
        setErrorMsg("This car is not available for the selected dates.");
        return;
      }

      // 2. Create booking
      await createBooking.mutateAsync({
        carId: car.id,
        startDate,
        endDate,
        customerName,
        contactInfo
      });

      toast({
        title: "Booking Requested",
        description: "Your reservation request has been submitted.",
      });
      
      // Reset & Close
      setStartDate("");
      setEndDate("");
      setCustomerName("");
      setContactInfo("");
      onClose();
      
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    }
  };

  const isPending = checkAvailability.isPending || createBooking.isPending;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Reserve Vehicle</h2>
              <p className="text-muted-foreground mt-1">{car.model} • ${car.pricePerDay}/day</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pick-up</label>
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drop-off</label>
                <input
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Details</label>
              <input
                type="text"
                placeholder="Email or Phone number"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-4 bg-primary text-primary-foreground py-4 rounded-xl font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                "Confirm Reservation"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
