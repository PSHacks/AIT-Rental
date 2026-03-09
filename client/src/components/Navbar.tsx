import { Link, useLocation } from "wouter";
import { ShipWheel, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-white/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShipWheel className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">LUXE</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Fleet
          </Link>
          <Link 
            href="/admin" 
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
              location === '/admin' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
