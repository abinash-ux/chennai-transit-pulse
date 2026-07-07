import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'passenger' | 'driver' | 'conductor' | 'inspector' | 'admin';

export const DEMO_PASSWORD = '123456';

export const DEMO_ACCOUNTS: Array<{
  role: UserRole;
  email: string;
  fullName: string;
  dashboard: string;
}> = [
  { role: 'passenger', email: 'passenger@demo.com', fullName: 'Demo Passenger', dashboard: '/dashboard/passenger' },
  { role: 'driver', email: 'driver@demo.com', fullName: 'Demo Driver', dashboard: '/dashboard/driver' },
  { role: 'conductor', email: 'conductor@demo.com', fullName: 'Demo Conductor', dashboard: '/dashboard/conductor' },
  { role: 'inspector', email: 'inspector@demo.com', fullName: 'Demo Inspector', dashboard: '/dashboard/inspector' },
  { role: 'admin', email: 'admin@demo.com', fullName: 'Demo Admin', dashboard: '/dashboard/admin' },
];

const DEMO_STORAGE_KEY = 'smart-chennai-demo-user';

const createDemoUser = (account: (typeof DEMO_ACCOUNTS)[number]) => ({
  id: `demo-${account.role}`,
  aud: 'authenticated',
  role: 'authenticated',
  email: account.email,
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'demo', providers: ['demo'] },
  user_metadata: { full_name: account.fullName, role: account.role },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
}) as unknown as User;

const getStoredDemoAccount = () => {
  try {
    const storedRole = localStorage.getItem(DEMO_STORAGE_KEY) as UserRole | null;
    return DEMO_ACCOUNTS.find((account) => account.role === storedRole) || null;
  } catch {
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const applyDemoAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    const demoUser = createDemoUser(account);
    setSession(null);
    setUser(demoUser);
    setUserRole(account.role);
    setProfile({
      user_id: demoUser.id,
      full_name: account.fullName,
      email: account.email,
      role: account.role,
    });
    localStorage.setItem(DEMO_STORAGE_KEY, account.role);
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleData) {
        setUserRole(roleData.role as UserRole);
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const demoAccount = getStoredDemoAccount();
    if (demoAccount) {
      applyDemoAccount(demoAccount);
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setUserRole(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        }
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setUser(null);
        setUserRole(null);
        setProfile(null);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const demoAccount = DEMO_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (demoAccount) {
      if (password !== DEMO_PASSWORD) {
        return { error: { message: 'Demo password is 123456' } };
      }

      applyDemoAccount(demoAccount);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'passenger') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    // If signup was successful and we have a user, update their role if not passenger
    if (!error && data.user && role !== 'passenger') {
      // Update the role (default is passenger from trigger)
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', data.user.id);
      
      if (roleError) console.error('Error updating role:', roleError);
    }

    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    await supabase.auth.signOut().catch(() => undefined);
    setUser(null);
    setSession(null);
    setUserRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
