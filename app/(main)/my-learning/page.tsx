"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Search, Filter, PlayCircle, Clock, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";

export default function MyLearningPage() {
  const supabase = createClient();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id);

      setEnrollments(data || []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role="learner" isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">Academic Library</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Your active curricula</p>
          </div>
          <div className="relative w-96">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 transition-colors" />
             <input 
               type="text" 
               placeholder="Search your library..." 
               className="w-full h-12 pl-14 pr-6 bg-muted/30 border-0 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/10 transition-all outline-none"
             />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-7xl mx-auto">
              {enrollments.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-40 bg-card rounded-[4rem] border border-border shadow-xl shadow-primary/5 transition-colors"
                >
                   <div className="bg-muted p-10 rounded-[3rem] mb-10 transition-colors">
                      <BookOpen className="w-20 h-20 text-muted-foreground opacity-20" />
                   </div>
                   <h2 className="text-3xl font-black text-foreground font-heading mb-4 text-center">Library Empty</h2>
                   <p className="text-muted-foreground font-medium mb-12 max-w-sm text-center transition-colors">
                      You haven't enrolled in any courses yet. Start your journey today.
                   </p>
                   <Link href="/courses">
                     <Button size="lg" className="btn-gradient text-white rounded-2xl px-16 h-20 text-xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                        Browse Catalogue
                     </Button>
                   </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {enrollments.map((enrollment) => (
                     <Link key={enrollment.id} href={`/my-learning/${enrollment.course_id}`}>
                        <div className="group bg-card rounded-[3rem] p-6 border border-border shadow-xl shadow-primary/5 hover:shadow-primary/15 transition-all duration-500 cursor-pointer h-full flex flex-col">
                           <div className="aspect-video rounded-[2rem] overflow-hidden relative mb-6">
                              <Image 
                                src={enrollment.course.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80'} 
                                alt={enrollment.course.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                                    <PlayCircle className="w-8 h-8 text-primary" />
                                 </div>
                              </div>
                           </div>
                           <div className="flex-1">
                              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 transition-colors">
                                 {enrollment.course.category}
                              </div>
                              <h3 className="text-xl font-black text-foreground font-heading mb-4 leading-tight group-hover:text-primary transition-colors">
                                 {enrollment.course.title}
                              </h3>
                              
                              {/* Progress Placeholder */}
                              <div className="space-y-3">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors">
                                    <span>Progress</span>
                                    <span className="text-primary">0%</span>
                                 </div>
                                 <div className="h-1.5 bg-muted rounded-full overflow-hidden transition-colors">
                                    <div className="h-full bg-primary w-0 rounded-full" />
                                 </div>
                              </div>
                           </div>
                           <div className="mt-8 pt-6 border-t border-border flex items-center justify-between transition-colors">
                              <div className="flex items-center gap-2 text-muted-foreground transition-colors">
                                 <Clock className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Ongoing</span>
                              </div>
                              <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors">
                                 Continue Learning
                              </Button>
                           </div>
                        </div>
                     </Link>
                   ))}
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
