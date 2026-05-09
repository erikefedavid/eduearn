"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  DollarSign, 
  AlertTriangle,
  Ban,
  CheckCircle2,
  Search,
  Filter
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/loading-screen";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeCourses: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error("Access Denied: Admin Privileges Required");
        router.push("/dashboard");
        return;
      }

      setProfile(profile);
      await loadAdminData();
      setLoading(false);
    }

    async function loadAdminData() {
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: courseData } = await supabase
        .from('courses')
        .select('*, instructor:instructor_id(full_name)')
        .order('created_at', { ascending: false });

      setUsers(userData || []);
      setCourses(courseData || []);
      setStats({
        totalUsers: userData?.length || 0,
        totalRevenue: 1250000, 
        activeCourses: courseData?.length || 0,
        pendingWithdrawals: 12
      });
    }

    checkAdmin();
  }, [router, supabase]);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Admin Protocol Deactivated");
  };

  const onToggleBan = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'restricted' : 'active';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast.success(newStatus === 'restricted' ? "User restricted" : "User restored");
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role={profile?.role || "learner"} isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Responsive Header */}
        <header className="h-auto min-h-[100px] bg-card border-b border-border px-6 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 transition-colors duration-500">
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
             </div>
             <div>
                <h1 className="text-xl md:text-2xl font-black text-foreground font-heading">Command Center</h1>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-red-500">Administrator Protocol</p>
             </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
             <div className="text-right hidden xs:block">
                <div className="text-sm font-black text-foreground">{profile.full_name}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Super Admin</div>
             </div>
             <Button 
               variant="ghost" 
               onClick={onSignOut}
               className="h-10 md:h-12 px-4 md:px-6 rounded-xl border border-red-500/20 text-red-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
             >
                Exit Protocol
             </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar w-full">
           <div className="max-w-7xl mx-auto space-y-10 md:space-y-12 pb-40 md:pb-20">
              
              {/* Stats Grid - Stackable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                 <AdminStatCard title="Total Citizens" value={stats.totalUsers} icon={<Users />} color="primary" />
                 <AdminStatCard title="Market Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign />} color="green" />
                 <AdminStatCard title="Library Assets" value={stats.activeCourses} icon={<BookOpen />} color="secondary" />
                 <AdminStatCard title="Payout Requests" value={stats.pendingWithdrawals} icon={<AlertTriangle />} color="red" />
              </div>

              {/* Management Layout - Responsive Stacking */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
                 <div className="lg:col-span-2 space-y-10 md:space-y-12">
                    {/* User Directory */}
                    <div className="bg-card rounded-[2.5rem] md:rounded-[3.5rem] border border-border overflow-hidden shadow-xl shadow-primary/5 transition-colors">
                       <div className="p-8 md:p-10 border-b border-border flex items-center justify-between">
                          <h3 className="text-xl md:text-2xl font-black text-foreground font-heading">Citizen Directory</h3>
                          <div className="flex gap-2">
                             <Button variant="ghost" size="icon" className="rounded-xl border border-border"><Search className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" className="rounded-xl border border-border"><Filter className="w-4 h-4" /></Button>
                          </div>
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[600px]">
                             <thead>
                                <tr className="border-b border-border bg-muted/20">
                                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                </tr>
                             </thead>
                             <tbody>
                                {users.map((u) => (
                                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                                     <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs">{u.full_name?.[0] || 'U'}</div>
                                           <div>
                                              <div className="text-sm font-bold text-foreground line-clamp-1">{u.full_name}</div>
                                              <div className="text-[10px] font-medium text-muted-foreground line-clamp-1">{u.email}</div>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-6 py-6">
                                        <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest border-border text-muted-foreground">
                                           {u.role}
                                        </Badge>
                                     </td>
                                      <td className="px-6 py-6 text-center">
                                         <div className={`w-2.5 h-2.5 rounded-full mx-auto ${u.status === 'restricted' ? 'bg-red-500' : 'bg-green-500'}`} title={u.status} />
                                      </td>
                                      <td className="px-10 py-6 text-right">
                                         <Button 
                                           variant="ghost" 
                                           size="icon" 
                                           onClick={() => onToggleBan(u.id, u.status || 'active')}
                                           className={`rounded-xl ${u.status === 'restricted' ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                                         >
                                            {u.status === 'restricted' ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                         </Button>
                                      </td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>

                 {/* Security Feed - Stacks on bottom on mobile */}
                 <div className="space-y-10 md:space-y-12">
                    <div className="bg-red-500/5 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 border border-red-500/10">
                       <div className="flex items-center gap-3 mb-6">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <h3 className="text-xl font-black text-red-500 font-heading">Security Feed</h3>
                       </div>
                       <p className="text-xs font-medium text-red-500/70 leading-relaxed mb-8">
                          Unauthorized access attempts detected from localized IPs. Protocol Gamma initiated.
                       </p>
                       <Button className="w-full bg-red-500 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20">
                          Review logs
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function AdminStatCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    green: "text-green-500 bg-green-500/10",
    red: "text-red-500 bg-red-500/10"
  };

  return (
    <div className="bg-card rounded-[2.5rem] md:rounded-[3rem] p-8 border border-border shadow-xl shadow-primary/5 transition-all duration-300">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
          {icon}
       </div>
       <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</div>
       <div className="text-2xl md:text-3xl font-black text-foreground font-heading">{value}</div>
    </div>
  );
}
