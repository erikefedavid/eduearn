"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  ChevronLeft, 
  Star, 
  Users, 
  Clock, 
  Globe, 
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/payment-button";
import { LoadingScreen } from "@/components/loading-screen";
import { toast } from "sonner";

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [course, setCourse] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }

      const { data: course } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id(full_name, avatar_url),
          chapters(*)
        `)
        .eq('id', courseId)
        .single();

      if (!course) {
        router.push("/courses");
        return;
      }

      if (profile.is_admin) {
        toast.error("Admins must use the Command Center for course oversight.");
        router.push("/admin");
        return;
      }

      setCourse(course);
      setTimeout(() => setLoading(false), 1200);
    }
    loadData();
  }, [courseId, router, supabase]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role={profile?.role || "learner"} isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-6 md:px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-muted transition-colors">
             <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </Button>
          <div className="flex items-center gap-4">
             <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex">Share Course</Button>
             <Badge className="bg-primary/10 text-primary border-0 font-bold px-4 py-1 text-[8px] sm:text-[10px]">Academic Verification Active</Badge>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
           <div className="max-w-6xl mx-auto py-6 md:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">
                 
                 {/* Main Content */}
                 <div className="lg:col-span-2 space-y-10 md:space-y-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                       <div className="flex items-center gap-3 mb-6">
                          <Badge className="bg-secondary text-white border-0 font-bold px-4">{course.category}</Badge>
                          <div className="flex items-center text-amber-500 gap-1">
                             <Star className="w-4 h-4 fill-current" />
                             <span className="text-sm font-bold text-foreground">4.9</span>
                          </div>
                       </div>
                       <h1 className="text-3xl md:text-5xl font-bold text-foreground font-heading mb-6 leading-tight">{course.title}</h1>
                       <div className="flex items-center gap-4 mb-10">
                          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center transition-colors overflow-hidden">
                             {course.profiles?.avatar_url ? (
                               <Image src={course.profiles.avatar_url} alt={course.profiles.full_name} width={48} height={48} className="object-cover" />
                             ) : (
                               <Users className="w-6 h-6 text-primary" />
                             )}
                          </div>
                          <div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors">Instructor</div>
                             <div className="text-sm font-bold text-foreground">{course.profiles?.full_name}</div>
                          </div>
                       </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-video bg-muted rounded-[3rem] overflow-hidden relative shadow-2xl shadow-primary/5 border border-border transition-colors"
                    >
                       <img 
                         src={course.image_url || {
                           "Technology": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
                           "Law": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
                           "Engineering": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
                           "Medicine": "https://images.unsplash.com/photo-1505751172107-597d5a4d4b1b?q=80&w=2070&auto=format&fit=crop",
                           "Business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
                         }[course.category as string] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
                         alt={course.title}
                         className="w-full h-full object-cover"
                       />
                    </motion.div>

                    <div className="space-y-6">
                       <h2 className="text-3xl font-bold text-foreground font-heading">Course Description</h2>
                       <p className="text-muted-foreground text-lg leading-relaxed font-medium transition-colors">
                          {course.description || "No description provided for this professional academic program."}
                       </p>
                    </div>

                    <div className="space-y-8">
                       <h2 className="text-3xl font-bold text-foreground font-heading">Curriculum Content</h2>
                       <div className="space-y-4 pb-20">
                          {course.chapters?.map((chapter: any, index: number) => (
                            <div key={chapter.id} className="flex items-center justify-between p-6 bg-card rounded-3xl border border-border shadow-sm transition-colors hover:border-primary/20 transition-all cursor-default">
                               <div className="flex items-center gap-6">
                                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary font-black text-xs transition-colors">
                                     {index + 1}
                                  </div>
                                  <div>
                                     <div className="text-sm font-bold text-foreground">{chapter.title}</div>
                                     <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors">{chapter.content_type || 'Video'} lecture</div>
                                  </div>
                                </div>
                               <Lock className="w-4 h-4 text-muted-foreground opacity-30" />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Sidebar / Checkout */}
                 <div className="lg:col-span-1">
                    <div className="sticky top-10 bg-card p-10 rounded-[3rem] border border-border shadow-2xl shadow-primary/5 space-y-10 transition-colors">
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 transition-colors">Enrollment Fee</div>
                          <div className="text-5xl font-bold text-secondary font-heading">₦{course.price.toLocaleString()}</div>
                       </div>

                       <div className="space-y-4">
                           {profile?.is_admin || profile?.role === "instructor" ? (
                             <div className="p-8 bg-muted/50 rounded-[2rem] border-2 border-dashed border-border text-center">
                                <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Restricted Access</div>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                                   As an {profile?.is_admin ? "Administrator" : "Instructor"}, you cannot enroll in courses. Learning is reserved for student citizens.
                                </p>
                             </div>
                           ) : (
                             <>
                               <PaymentButton courseId={course.id} amount={course.price} />
                               <p className="text-[10px] text-center text-muted-foreground font-medium transition-colors">Secured by Paystack. Instant access after payment.</p>
                             </>
                           )}
                        </div>

                       <div className="pt-10 border-t border-border space-y-6 transition-colors">
                          <div className="flex items-center gap-4">
                             <CheckCircle2 className="w-5 h-5 text-green-500" />
                             <span className="text-sm font-bold text-foreground">Lifetime Access</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <CheckCircle2 className="w-5 h-5 text-green-500" />
                             <span className="text-sm font-bold text-foreground">Academic Certificate</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <CheckCircle2 className="w-5 h-5 text-green-500" />
                             <span className="text-sm font-bold text-foreground">Downloadable Resources</span>
                          </div>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
