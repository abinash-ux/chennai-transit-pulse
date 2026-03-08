import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function DashboardRouter() {
  const { userRole, loading, user } = useAuth();
  const navigate = useNavigate();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    // Give fetchUserData time to complete
    const timer = setTimeout(() => setWaited(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && userRole) {
      navigate(`/dashboard/${userRole}`, { replace: true });
    } else if (!loading && waited && user && !userRole) {
      // Default to passenger if role not found
      navigate('/dashboard/passenger', { replace: true });
    }
  }, [userRole, loading, navigate, waited, user]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
