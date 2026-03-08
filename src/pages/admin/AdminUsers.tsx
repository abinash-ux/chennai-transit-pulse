import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
    ]).then(([p, r]) => {
      if (p.data) setProfiles(p.data);
      if (r.data) setRoles(r.data);
    });
  }, []);

  const getUserRole = (userId: string) => {
    return roles.find(r => r.user_id === userId)?.role || 'passenger';
  };

  const filtered = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getByRole = (role: string) => filtered.filter(p => getUserRole(p.user_id) === role);

  const roleBadge = (role: string) => {
    const cls = role === 'admin' ? 'badge-danger' : role === 'driver' ? 'badge-info' :
      role === 'conductor' ? 'badge-warning' : role === 'inspector' ? 'badge-success' : '';
    return <Badge className={cls}>{role}</Badge>;
  };

  const UserList = ({ users }: { users: any[] }) => (
    <div className="space-y-2">
      {users.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">No users found</p>
      ) : users.map((u) => (
        <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
          <div>
            <p className="font-medium">{u.full_name}</p>
            <p className="text-sm text-muted-foreground">{u.email}</p>
          </div>
          {roleBadge(getUserRole(u.user_id))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">User Management</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="passenger">Passengers ({getByRole('passenger').length})</TabsTrigger>
          <TabsTrigger value="driver">Drivers ({getByRole('driver').length})</TabsTrigger>
          <TabsTrigger value="conductor">Conductors ({getByRole('conductor').length})</TabsTrigger>
          <TabsTrigger value="inspector">Inspectors ({getByRole('inspector').length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><GlassCard><UserList users={filtered} /></GlassCard></TabsContent>
        <TabsContent value="passenger"><GlassCard><UserList users={getByRole('passenger')} /></GlassCard></TabsContent>
        <TabsContent value="driver"><GlassCard><UserList users={getByRole('driver')} /></GlassCard></TabsContent>
        <TabsContent value="conductor"><GlassCard><UserList users={getByRole('conductor')} /></GlassCard></TabsContent>
        <TabsContent value="inspector"><GlassCard><UserList users={getByRole('inspector')} /></GlassCard></TabsContent>
      </Tabs>
    </div>
  );
}
