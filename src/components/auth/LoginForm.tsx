import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const selectedDemoAccount = DEMO_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
    } else {
      toast.success('Welcome back!');
      navigate(selectedDemoAccount?.dashboard || '/dashboard');
    }

    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setLoading(true);

    const account = DEMO_ACCOUNTS.find((item) => item.email === demoEmail);
    const { error } = await signIn(demoEmail, DEMO_PASSWORD);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
    } else {
      toast.success(`${account?.fullName || 'Demo user'} logged in`);
      navigate(account?.dashboard || '/dashboard');
    }

    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 input-glow bg-background/50 border-border"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 input-glow bg-background/50 border-border"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full btn-glow text-primary-foreground font-semibold"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Demo dashboard logins</p>
          <p className="text-xs text-muted-foreground">Password for all demo accounts: {DEMO_PASSWORD}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.role}
              type="button"
              variant="outline"
              size="sm"
              className="h-auto justify-start py-2 text-left"
              disabled={loading}
              onClick={() => handleDemoLogin(account.email)}
            >
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold capitalize">{account.role}</span>
                <span className="text-[11px] text-muted-foreground">{account.email}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </motion.form>
  );
}
