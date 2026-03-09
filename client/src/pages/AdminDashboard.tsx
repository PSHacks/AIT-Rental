import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useAdminBookings, useUpdateBooking } from "@/hooks/use-bookings";
import { useCars, useDeleteCar } from "@/hooks/use-cars";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check, X, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "fleet">("bookings");
  const [, navigate] = useLocation();
  const { logout, token } = useAuth();
  
  const { data: bookings, isLoading: bookingsLoading } = useAdminBookings(token);
  const updateBooking = useUpdateBooking(token);
  
  const { data: cars, isLoading: carsLoading } = useCars("All", token);
  const deleteCar = useDeleteCar(token);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your fleet and reservations.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            
            <div className="flex bg-secondary p-1 rounded-xl w-max">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "bookings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("fleet")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "fleet" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fleet
            </button>
            </div>
          </div>
        </div>

        {activeTab === "bookings" && (
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookingsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </td>
                    </tr>
                  ) : bookings?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings?.map((b) => (
                      <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-muted-foreground">#{b.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{b.customerName}</p>
                          <p className="text-xs text-muted-foreground">{b.contactInfo}</p>
                        </td>
                        <td className="px-6 py-4">
                          {b.startDate} <span className="text-muted-foreground px-1">→</span> {b.endDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                            ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                              b.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-amber-100 text-amber-800'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => updateBooking.mutate({ id: b.id, status: 'Confirmed' })}
                                  disabled={updateBooking.isPending}
                                  className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                  title="Confirm"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateBooking.mutate({ id: b.id, status: 'Cancelled' })}
                                  disabled={updateBooking.isPending}
                                  className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "fleet" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : cars?.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-card border border-border rounded-3xl">
                <p className="text-muted-foreground">Fleet is empty.</p>
              </div>
            ) : (
              cars?.map((car) => (
                <div key={car.id} className={`bg-card rounded-2xl border p-6 flex flex-col ${car.isAvailable ? 'border-border' : 'border-destructive/30 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{car.type}</span>
                      <h3 className="font-display text-xl font-bold text-foreground mt-1">{car.model}</h3>
                    </div>
                    {!car.isAvailable && (
                      <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-md font-bold">Removed</span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-muted-foreground mb-6">SN: {car.serialNumber}</p>
                  
                  <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-semibold">${car.pricePerDay}/day</span>
                    {car.isAvailable && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this car? It will no longer be available for booking.")) {
                            deleteCar.mutate(car.id);
                          }
                        }}
                        disabled={deleteCar.isPending}
                        className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
