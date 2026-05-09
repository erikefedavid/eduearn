"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { toast } from "sonner";
import gsap from "gsap";
import { LoadingScreen } from "@/components/loading-screen";
import { 
  LogOut, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Plus, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  BarChart3
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Dynamic Greeting Logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    async function loadData() {
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

      if (!profile) {
        router.push("/onboarding");
        return;
      }

      if (profile.is_admin) {
        router.push("/admin");
        return;
      }

      setProfile(profile);
      setTimeout(() => setLoading(false), 1500);
      
      setTimeout(() => {
        gsap.fromTo(".dashboard-content", 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }
        );
      }, 1600);
    }
    loadData();
  }, [router, supabase]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role={profile?.role || "learner"} isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">
              {profile.role === "instructor" ? "Executive Instructor Panel" : "Academic Learning Portal"}
            </h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-sm font-black text-foreground">{profile.full_name}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{profile.role}</div>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden transition-colors">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <GraduationCap className="w-6 h-6 text-muted-foreground" />}
             </div>
             <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-5 h-5" />
             </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           <motion.div 
             className="max-w-7xl mx-auto space-y-12 dashboard-content"
           >
              {/* Welcome Banner */}
              <div className="relative rounded-[3.5rem] bg-slate-900 dark:bg-primary p-12 text-white overflow-hidden shadow-2xl shadow-primary/20">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />
                 <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-black font-heading mb-4 tracking-tighter">
                      {greeting}, {profile.full_name.split(' ')[0]}!
                    </h2>
                    <p className="text-indigo-100 dark:text-emerald-50 text-lg font-medium mb-8 leading-relaxed">
                      {profile.role === "instructor" 
                        ? "Your courses have reached 142 new students this week. You're bridging the knowledge gap in Nigeria."
                        : "Ready to advance your academic journey? You have 0 courses in progress. Let's start learning."}
                    </p>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-xs font-black uppercase tracking-widest">+12.5% Growth</span>
                       </div>
                       {profile.role === "instructor" && (
                         <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                           <DollarSign className="w-5 h-5 text-amber-400" />
                           <span className="text-xs font-black uppercase tracking-widest">₦85,400.00 Total Revenue</span>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Grid Content */}
              {profile.role === "instructor" ? (
                 <InstructorView profile={profile} setProfile={setProfile} />
              ) : (
                 <LearnerView profile={profile} />
              )}
           </motion.div>
        </div>
      </main>
    </div>
  );
}

function InstructorView({ profile, setProfile }: { profile: any, setProfile: any }) {
  const router = useRouter();
  
  return (
    <div className="grid lg:grid-cols-3 gap-12">
      {/* Left Column: Stats & Recent Activity */}
      <div className="lg:col-span-2 space-y-12">
        <div className="grid sm:grid-cols-2 gap-8">
           <StatCard 
             title="Total Revenue" 
             value="₦45,200" 
             icon={<DollarSign className="w-6 h-6 text-primary" />} 
             trend="₦12,000 this week"
           />
           <StatCard 
             title="Total Students" 
             value="142" 
             icon={<Users className="w-6 h-6 text-secondary" />} 
             trend="8 new today"
           />
        </div>

        <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-foreground font-heading">Recent Enrollments</h3>
              <Button variant="ghost" className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">View All</Button>
           </div>
           
           <div className="space-y-6">
              <EnrollmentRow name="Chinedu Okafor" course="Nigerian Tax Law" date="2h ago" amount="₦15,000" />
              <EnrollmentRow name="Amina Yusuf" course="Data Analytics" date="5h ago" amount="₦20,000" />
              <EnrollmentRow name="Segun Adebayo" course="Renewable Energy" date="1d ago" amount="₦12,500" />
              <EnrollmentRow name="Olamide Bakare" course="Nigerian Tax Law" date="1d ago" amount="₦15,000" />
           </div>
        </div>

        <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-foreground font-heading">My Courses</h3>
              <Button onClick={() => router.push("/instructor/courses/new")} className="bg-primary text-white rounded-2xl gap-3 font-black text-xs uppercase tracking-widest px-8 h-14 shadow-xl shadow-primary/30">
                 <Plus className="w-5 h-5" /> Launch Course
              </Button>
           </div>
           
           <div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-[3rem] border-2 border-dashed border-border transition-colors">
              <div className="bg-card p-6 rounded-3xl shadow-sm mb-6 transition-colors">
                 <BarChart3 className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mb-2">Academic Inventory</p>
              <h4 className="text-foreground font-bold mb-6">You haven't launched any courses yet.</h4>
           </div>
        </div>
      </div>

      {/* Right Column: Earnings & Performance */}
      <div className="space-y-12">
         <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-2xl shadow-primary/5 overflow-hidden relative transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-bl-[4rem]" />
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Withdrawable Balance</div>
            <div className="text-5xl font-black text-foreground font-heading mb-10">₦{profile.balance?.toLocaleString() || "0"}<span className="text-xl text-muted-foreground">.00</span></div>
            <Button 
              onClick={async () => {
                if (!profile.balance || profile.balance <= 0) {
                  toast.error("Insufficient balance to withdraw");
                  return;
                }
                const res = await fetch("/api/withdraw", { method: "POST" });
                if (res.ok) {
                  toast.success("Withdrawal request sent!");
                  setProfile({...profile, balance: 0});
                } else {
                  toast.error("Withdrawal failed");
                }
              }}
              className="w-full btn-gradient text-white rounded-2xl h-16 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
            >
               Request Payout
            </Button>
            
            <div className="mt-12 pt-10 border-t border-border">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Payout History</h4>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
               </div>
               <div className="space-y-6">
                  <PayoutItem title="Weekly Sales" date="Nov 28, 2024" amount="₦4,500.00" status="Processed" />
                  <PayoutItem title="Weekly Sales" date="Oct 30, 2024" amount="₦3,200.00" status="Processed" />
                  <PayoutItem title="System Bonus" date="Oct 15, 2024" amount="₦2,000.00" status="Processed" />
               </div>
               <Button variant="link" onClick={() => router.push('/settings')} className="text-primary font-black text-[10px] uppercase tracking-widest p-0 mt-10 hover:no-underline">
                  Update Payout Credentials
               </Button>
            </div>
         </div>

         <div className="bg-secondary/5 rounded-[3.5rem] p-10 border border-secondary/10 transition-colors duration-500">
            <h3 className="text-xl font-black text-foreground font-heading mb-6">Expert Performance</h3>
            <div className="space-y-6">
               <div className="p-6 bg-card rounded-3xl border border-border shadow-sm transition-colors duration-500">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Course Rating</div>
                  <div className="text-2xl font-black text-foreground">4.9 / 5.0</div>
               </div>
               <div className="p-6 bg-card rounded-3xl border border-border shadow-sm transition-colors duration-500">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Student Completion</div>
                  <div className="text-2xl font-black text-foreground">84% Avg.</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function LearnerView({ profile }: { profile: any }) {
  return (
    <div className="grid lg:grid-cols-3 gap-12">
       <div className="lg:col-span-2 space-y-12">
          <div className="grid sm:grid-cols-2 gap-8">
             <StatCard 
               title="Courses Enrolled" 
               value="0" 
               icon={<GraduationCap className="w-6 h-6 text-primary" />} 
               trend="0 completed"
             />
             <StatCard 
               title="Learning Hours" 
               value="0h" 
               icon={<Clock className="w-6 h-6 text-secondary" />} 
               trend="Stay consistent!"
             />
          </div>
          <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
             <h3 className="text-2xl font-black text-foreground font-heading mb-10">Academic Progress</h3>
             <div className="flex flex-col items-center justify-center py-24 bg-muted/50 rounded-[3rem] border-2 border-dashed border-border transition-colors">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mb-2">No active curricula</p>
                <Button variant="outline" className="rounded-2xl font-black text-xs uppercase tracking-widest border-border h-12 px-8">Browse Catalogue</Button>
             </div>
          </div>
       </div>
       <div className="space-y-12">
          <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
             <h3 className="text-xl font-black text-foreground font-heading mb-10">Accomplishments</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-5 p-6 bg-muted/50 rounded-3xl border border-border transition-colors">
                   <div className="p-4 bg-card rounded-2xl shadow-sm text-muted-foreground transition-colors"><CheckCircle2 className="w-6 h-6" /></div>
                   <div>
                      <div className="text-xs font-black text-foreground uppercase tracking-widest">Novice Scholar</div>
                      <div className="text-[10px] font-medium text-muted-foreground transition-colors">Complete your first lecture</div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors group hover:border-primary/40 transition-all duration-300">
       <div className="flex justify-between items-start mb-10">
          <div className="p-5 bg-muted rounded-[2rem] transition-colors group-hover:bg-primary/10 transition-all">{icon}</div>
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2 transition-colors">{title}</div>
       <div className="text-4xl font-black text-foreground font-heading mb-4 tracking-tighter">{value}</div>
       <div className="text-xs font-bold text-muted-foreground flex items-center gap-2 transition-colors">
          {trend}
       </div>
    </div>
  );
}

function EnrollmentRow({ name, course, date, amount }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border hover:bg-muted transition-colors cursor-default transition-all">
       <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center font-black text-xs text-primary transition-colors">
             {name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
             <div className="text-sm font-black text-foreground">{name}</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{course}</div>
          </div>
       </div>
       <div className="text-right">
          <div className="text-sm font-black text-foreground">{amount}</div>
          <div className="text-[10px] font-medium text-muted-foreground">{date}</div>
       </div>
    </div>
  );
}

function PayoutItem({ title, date, amount, status }: any) {
  return (
    <div className="flex justify-between items-center">
       <div>
          <div className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{title}</div>
          <div className="text-[10px] font-medium text-muted-foreground transition-colors">{date}</div>
       </div>
       <div className="text-right">
          <div className="text-xs font-black text-foreground">{amount}</div>
          <div className="text-[10px] font-black uppercase text-green-500 tracking-widest">{status}</div>
       </div>
    </div>
  );
}
