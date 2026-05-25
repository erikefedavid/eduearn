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
  const [liveData, setLiveData] = useState<any>({});

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

      // Fetch dynamic live data
      if (profile.role === "instructor") {
        const { data: courses } = await supabase.from('courses').select('*, enrollments(id)').eq('instructor_id', user.id);
        const { data: transactions } = await supabase.from('transactions').select('*, profiles:learner_id(full_name), courses:course_id(title)').eq('instructor_id', user.id).order('created_at', { ascending: false });
        setLiveData({ courses: courses || [], transactions: transactions || [] });
      } else {
        const { data: enrollments } = await supabase.from('enrollments').select('*, courses(*, profiles:instructor_id(full_name))').eq('user_id', user.id);
        setLiveData({ enrollments: enrollments || [] });
      }

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
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
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
                        : "You have 3 courses in progress and a 7-day study streak. Keep up the academic excellence!"}
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
                 <InstructorView profile={profile} setProfile={setProfile} liveData={liveData} />
              ) : (
                 <LearnerView profile={profile} liveData={liveData} />
              )}
           </motion.div>
        </div>
      </main>
    </div>
  );
}

function InstructorView({ profile, setProfile, liveData }: { profile: any, setProfile: any, liveData: any }) {
  const router = useRouter();
  
  const recentTransactions = liveData.transactions ? liveData.transactions.slice(0, 4) : [];

  const myCourses = liveData.courses ? liveData.courses.map((c: any) => ({
    title: c.title,
    category: c.category_id || "Education",
    students: c.enrollments ? c.enrollments.length : 0,
    revenue: "₦" + (c.price * (c.enrollments ? c.enrollments.length : 0)).toLocaleString(),
    status: c.is_published ? "Published" : "Draft",
    image: c.image_url || c.thumbnail_url || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop",
    id: c.id
  })) : [];

  const totalRevenue = liveData.transactions 
    ? "₦" + liveData.transactions.reduce((acc: number, t: any) => acc + Number(t.amount), 0).toLocaleString() 
    : "₦0";

  const totalStudents = liveData.courses
    ? liveData.courses.reduce((acc: number, c: any) => acc + (c.enrollments ? c.enrollments.length : 0), 0)
    : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      {/* Left Column: Stats & Recent Activity */}
      <div className="lg:col-span-2 space-y-12">
        <div className="grid sm:grid-cols-2 gap-8">
           <StatCard 
             title="Total Revenue" 
             value={totalRevenue} 
             icon={<DollarSign className="w-6 h-6 text-primary" />} 
             trend={hasTransactions ? "Real-time sync" : "₦12,000 this week"}
           />
           <StatCard 
             title="Total Students" 
             value={totalStudents.toString()} 
             icon={<Users className="w-6 h-6 text-secondary" />} 
             trend={hasCourses ? "Based on real enrollments" : "8 new today"}
           />
        </div>

        <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-foreground font-heading">Recent Enrollments</h3>
              <Button variant="ghost" className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">View All</Button>
           </div>
           
           <div className="space-y-6">
              {recentTransactions.map((tx: any, i: number) => (
                <EnrollmentRow 
                  key={i}
                  name={tx.profiles?.full_name || "Unknown Citizen"} 
                  course={tx.courses?.title || "Unknown Course"} 
                  date={typeof tx.created_at === "string" && !tx.created_at.includes("ago") 
                        ? new Date(tx.created_at).toLocaleDateString() 
                        : tx.created_at} 
                  amount={typeof tx.amount === "number" ? `₦${tx.amount.toLocaleString()}` : tx.amount} 
                />
              ))}
           </div>
        </div>

        <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-foreground font-heading">My Courses</h3>
              <Button onClick={() => router.push("/instructor/courses/new")} className="bg-primary text-white rounded-2xl gap-3 font-black text-xs uppercase tracking-widest px-8 h-14 shadow-xl shadow-primary/30">
                 <Plus className="w-5 h-5" /> Launch Course
              </Button>
           </div>
           
           <div className="space-y-6">
              {myCourses.map((course: any, i: number) => (
                <div key={i} className="flex items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer group" onClick={() => router.push(`/instructor/courses/${course.id || "new"}`)}>
                   <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[100px]">{course.category}</span>
                         <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${course.status === "Published" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"}`}>{course.status}</span>
                      </div>
                      <div className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{course.title}</div>
                   </div>
                   <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-xs font-black text-foreground">{course.students} students</div>
                      <div className="text-[10px] font-bold text-secondary">{course.revenue}</div>
                   </div>
                </div>
              ))}
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
                const res = await fetch("/api/withdraw", { method: "POST" }).catch(() => { toast.error("Network error. Please try again."); return null; });
                if (res?.ok) {
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

function LearnerView({ profile, liveData }: { profile: any, liveData: any }) {
  const router = useRouter();

  const myProgress = liveData.enrollments ? liveData.enrollments.map((e: any) => {
    let progress = 0;
    try {
      const stored = localStorage.getItem(`progress_${e.course_id}`);
      if (stored) {
        progress = Math.min(100, JSON.parse(stored).length * 20); // simplified dummy calculation
      }
    } catch(err) {}

    return {
      id: e.course_id,
      title: e.courses?.title || "Unknown Course",
      category: e.courses?.category_id || "Education",
      progress: progress || 5, // give them at least 5% so bar shows
      instructor: e.courses?.profiles?.full_name || "Instructor",
      image: e.courses?.image_url || e.courses?.thumbnail_url || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    };
  }) : [];

  const totalEnrolled = liveData.enrollments ? liveData.enrollments.length : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-12">
       <div className="lg:col-span-2 space-y-12">
          <div className="grid sm:grid-cols-2 gap-8">
             <StatCard 
               title="Courses Enrolled" 
               value={totalEnrolled.toString()} 
               icon={<GraduationCap className="w-6 h-6 text-primary" />} 
               trend={liveData.enrollments ? "Real-time sync" : "0 completed"}
             />
             <StatCard 
               title="Learning Hours" 
               value="12h" 
               icon={<Clock className="w-6 h-6 text-secondary" />} 
               trend="+3h this week"
             />
          </div>

          <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-foreground font-heading">Academic Progress</h3>
                <Button variant="ghost" onClick={() => router.push("/my-learning")} className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">View All</Button>
             </div>
             <div className="space-y-6">
                {myProgress.map((course: any) => (
                  <div key={course.id} className="flex items-center gap-6 p-5 bg-muted/30 rounded-3xl border border-border hover:bg-muted/50 transition-all cursor-pointer group" onClick={() => router.push(`/my-learning/${course.id || "1"}`)}>
                     <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 truncate">{course.category}</div>
                        <div className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{course.title}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">{course.instructor}</div>
                     </div>
                     <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-primary">{course.progress}%</div>
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                           <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-foreground font-heading">Recommended For You</h3>
                <Button variant="ghost" onClick={() => router.push("/courses")} className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">Browse All</Button>
             </div>
             <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Clinical Pharmacology", category: "Medicine", price: "₦35,000", instructor: "Dr. Ngozi Okonkwo", image: "https://images.unsplash.com/photo-1505751172107-597d5a4d4b1b?q=80&w=400&auto=format&fit=crop" },
                  { title: "Renewable Energy Systems", category: "Engineering", price: "₦28,000", instructor: "Prof. Fatima Bello", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop" },
                ].map((rec, i) => (
                  <div key={i} className="group p-5 bg-muted/30 rounded-3xl border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push("/courses")}>
                     <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-muted">
                        <img src={rec.image} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{rec.category}</div>
                     <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors mb-2">{rec.title}</h4>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-muted-foreground">{rec.instructor}</span>
                        <span className="text-sm font-black text-secondary">{rec.price}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>

       <div className="space-y-12">
          <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
             <h3 className="text-xl font-black text-foreground font-heading mb-10">Accomplishments</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-5 p-6 bg-primary/5 rounded-3xl border border-primary/20 transition-colors">
                   <div className="p-4 bg-primary/10 rounded-2xl shadow-sm text-primary transition-colors"><CheckCircle2 className="w-6 h-6" /></div>
                   <div>
                      <div className="text-xs font-black text-foreground uppercase tracking-widest">Novice Scholar</div>
                      <div className="text-[10px] font-medium text-primary transition-colors">First lecture completed ✓</div>
                   </div>
                </div>
                <div className="flex items-center gap-5 p-6 bg-secondary/5 rounded-3xl border border-secondary/20 transition-colors">
                   <div className="p-4 bg-secondary/10 rounded-2xl shadow-sm text-secondary transition-colors"><BookOpen className="w-6 h-6" /></div>
                   <div>
                      <div className="text-xs font-black text-foreground uppercase tracking-widest">Curious Mind</div>
                      <div className="text-[10px] font-medium text-secondary transition-colors">Enrolled in 3 courses ✓</div>
                   </div>
                </div>
                <div className="flex items-center gap-5 p-6 bg-muted/50 rounded-3xl border border-border transition-colors">
                   <div className="p-4 bg-card rounded-2xl shadow-sm text-muted-foreground transition-colors"><TrendingUp className="w-6 h-6" /></div>
                   <div>
                      <div className="text-xs font-black text-foreground uppercase tracking-widest">Dedicated Learner</div>
                      <div className="text-[10px] font-medium text-muted-foreground transition-colors">10+ hours of study</div>
                   </div>
                </div>
                <div className="flex items-center gap-5 p-6 bg-muted/50 rounded-3xl border border-border transition-colors opacity-50">
                   <div className="p-4 bg-card rounded-2xl shadow-sm text-muted-foreground transition-colors"><GraduationCap className="w-6 h-6" /></div>
                   <div>
                      <div className="text-xs font-black text-foreground uppercase tracking-widest">Academic Champion</div>
                      <div className="text-[10px] font-medium text-muted-foreground transition-colors">Complete 5 courses — 2/5</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Study Streak */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[3.5rem] p-10 border border-primary/10 transition-colors">
             <h3 className="text-xl font-black text-foreground font-heading mb-6">Study Streak 🔥</h3>
             <div className="text-5xl font-black text-primary font-heading mb-2">7 Days</div>
             <p className="text-xs font-medium text-muted-foreground mb-6">Keep learning daily to maintain your streak!</p>
             <div className="flex gap-2">
                {["M","T","W","T","F","S","S"].map((day, i) => (
                  <div key={i} className={`flex-1 h-10 rounded-xl flex items-center justify-center text-[10px] font-black ${i < 5 ? "bg-primary text-white" : i < 7 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                     {day}
                  </div>
                ))}
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
