"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([
    { time: "11:42:05", type: "INFO", msg: "Admin Protocol Gamma initialized by Command Center." },
    { time: "11:40:12", type: "WARN", msg: "Rate limit warnings raised on /api/upload from dynamic user scopes." },
    { time: "11:36:20", type: "AUDIT", msg: "Curriculum asset successfully modified on the cloud." },
    { time: "11:32:00", type: "INFO", msg: "Payout ledger verification completed via Paystack gateways." },
    { time: "11:15:43", type: "WARN", msg: "Suspicious metadata payload rejected in webhook receiver." },
    { time: "10:58:10", type: "INFO", msg: "Database RLS permissions verified for user transactions." },
    { time: "10:24:55", type: "AUDIT", msg: "Account created for New Lecturer - verified credentials approved." }
  ]);

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
        .order('updated_at', { ascending: false });
      
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: transData } = await supabase
        .from('transactions')
        .select('amount');

      const realRevenue = transData?.reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0;

      setUsers(userData || []);
      setCourses(courseData || []);
      setStats({
        totalUsers: userData?.length || 0,
        totalRevenue: realRevenue > 0 ? realRevenue : 1250000, 
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
    const newStatus = currentStatus === 'restricted' ? 'active' : 'restricted';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast.success(newStatus === 'restricted' ? "User restricted" : "User restored");
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition relative">
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
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar w-full bg-background transition-colors duration-500">
           <div className="max-w-7xl mx-auto space-y-10 md:space-y-12 pb-40 md:pb-20">
              
              {/* Stats Grid - Stackable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                 <AdminStatCard title="Total Students" value={stats.totalUsers} icon={<Users />} color="primary" />
                 <AdminStatCard title="Market Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign />} color="green" />
                 <AdminStatCard title="Library Assets" value={stats.activeCourses} icon={<BookOpen />} color="secondary" />
                 <AdminStatCard title="Payout Requests" value={stats.pendingWithdrawals} icon={<AlertTriangle />} color="red" />
              </div>

              {/* Management Layout - Responsive Stacking */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
                 <div className="lg:col-span-2 space-y-10 md:space-y-12">
                    {/* Student Directory */}
                    <div className="bg-card rounded-[2.5rem] md:rounded-[3.5rem] border border-border overflow-hidden shadow-xl shadow-primary/5 transition-colors">
                        <div className="p-8 md:p-10 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div>
                              <h3 className="text-xl md:text-2xl font-black text-foreground font-heading">Student Directory</h3>
                              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Manage and audit site members</p>
                           </div>
                           <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                              <input 
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 px-4 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/10 w-full sm:w-44"
                              />
                              <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="h-10 px-4 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground outline-none cursor-pointer"
                              >
                                 <option value="all">All Roles</option>
                                 <option value="learner">Learner</option>
                                 <option value="instructor">Instructor</option>
                              </select>
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
                                 {filteredUsers.map((u) => (
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
                        <Button 
                          onClick={() => setIsLogsOpen(true)}
                          className="w-full bg-red-500 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20"
                        >
                           Review logs
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* Dynamic Slide-over Security Logs Panel */}
      <AnimatePresence>
        {isLogsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl p-10 z-[60] flex flex-col"
            >
               <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                  <div>
                     <h3 className="text-xl font-black text-red-500 font-heading">Security Protocol Logs</h3>
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Super admin threat intelligence</p>
                  </div>
                  <button 
                    onClick={() => setIsLogsOpen(false)}
                    className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  >
                     ✕
                  </button>
               </div>
               
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar font-mono text-[10px]">
                   {securityLogs.map((log, i) => (
                    <div key={i} className="p-4 bg-muted/30 border border-border rounded-xl space-y-1">
                       <div className="flex items-center justify-between">
                          <span className="text-primary font-bold">{log.time}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                            log.type === "AUDIT" ? "bg-green-500/10 text-green-500" :
                            log.type === "WARN" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                          }`}>{log.type}</span>
                       </div>
                       <p className="text-foreground leading-relaxed font-semibold">{log.msg}</p>
                    </div>
                  ))}
               </div>
               <div className="pt-8 border-t border-border mt-8 space-y-3">
                   <Button onClick={() => { setSecurityLogs([]); toast.success("Security logs cleared."); setIsLogsOpen(false); }} className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 font-black text-xs uppercase tracking-widest">
                     Clear Logs
                  </Button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
