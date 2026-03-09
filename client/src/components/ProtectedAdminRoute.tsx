import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { AdminDashboard } from '@/pages/AdminDashboard';

export function ProtectedAdminRoute() {
  const { isLoggedIn } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null; // Redirect happens in useEffect
  }

  return <AdminDashboard />;
}
