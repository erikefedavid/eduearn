"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Play, 
  FileText, 
  Headphones, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  Menu,
  Download
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { Badge } from "@/components/ui/badge";

export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapter, setActiveChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    async function loadCourseContent() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Verify Enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (!enrollment) {
        setIsEnrolled(false);
        setLoading(false);
        return;
      }

      setIsEnrolled(true);

      // 2. Fetch Course and Chapters
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      const { data: chapterData } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      setCourse(courseData);
      setChapters(chapterData || []);
      if (chapterData && chapterData.length > 0) {
        setActiveChapter(chapterData[0]);
      }
      setLoading(false);
    }
    loadCourseContent();
  }, [courseId, router, supabase]);

  if (loading) return <LoadingScreen />;

  if (!isEnrolled) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-muted p-10 rounded-[3rem] mb-8">
           <Lock className="w-20 h-20 text-muted-foreground opacity-20" />
        </div>
        <h1 className="text-3xl font-black text-foreground font-heading mb-4">Content Locked</h1>
        <p className="text-muted-foreground max-w-md mb-10 font-medium leading-relaxed">
           You are not enrolled in this course. Please return to the catalogue to purchase access.
        </p>
        <Button onClick={() => router.push("/courses")} className="btn-gradient text-white rounded-2xl px-12 h-16 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
           Browse Catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      {/* Chapter Sidebar */}
      <aside className="w-96 bg-card border-r border-border flex flex-col transition-colors duration-500">
         <div className="p-8 border-b border-border flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push("/my-learning")} className="rounded-xl text-muted-foreground hover:bg-muted">
               <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="text-right">
               <div className="text-[10px] font-black uppercase tracking-widest text-primary">Curriculum</div>
               <div className="text-xs font-bold text-foreground truncate max-w-[120px]">{course?.title}</div>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapter(chapter)}
                className={`w-full p-6 rounded-3xl flex items-center gap-4 text-left transition-all group ${
                  activeChapter?.id === chapter.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "bg-muted/30 hover:bg-muted text-foreground border border-border"
                }`}
              >
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                   activeChapter?.id === chapter.id ? "bg-white/20" : "bg-muted"
                 }`}>
                    {index + 1}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate mb-1">{chapter.title}</div>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                      activeChapter?.id === chapter.id ? "text-white/60" : "text-muted-foreground"
                    }`}>
                       {chapter.content_type === "pdf" ? <FileText className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                       {chapter.content_type}
                    </div>
                 </div>
                 {index === 0 && <CheckCircle2 className={`w-4 h-4 ${activeChapter?.id === chapter.id ? "text-white" : "text-primary"}`} />}
              </button>
            ))}
         </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
         <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between transition-colors duration-500">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {activeChapter?.content_type === "pdf" ? <FileText className="w-5 h-5 text-primary" /> : <Headphones className="w-5 h-5 text-primary" />}
               </div>
               <h2 className="text-xl font-black text-foreground font-heading">{activeChapter?.title}</h2>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-border text-muted-foreground gap-2">
                  <Download className="w-4 h-4" /> Resources
               </Button>
               <Button className="bg-primary text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-primary/20 gap-2">
                  Complete Lesson <ArrowRight className="w-4 h-4" />
               </Button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center">
            <motion.div 
              key={activeChapter?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-5xl aspect-video bg-card rounded-[4rem] border border-border shadow-2xl shadow-primary/5 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden transition-colors"
            >
               {/* Decorative background elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

               <div className="relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-10 animate-pulse">
                     {activeChapter?.content_type === "pdf" ? (
                       <FileText className="w-10 h-10 text-primary" />
                     ) : (
                       <Headphones className="w-10 h-10 text-primary" />
                     )}
                  </div>
                  <h3 className="text-3xl font-black text-foreground font-heading mb-6 tracking-tight">
                     {activeChapter?.content_type === "pdf" ? "Scholarly Manuscript" : "Expert Audio Lecture"}
                  </h3>
                  <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                     {activeChapter?.content_type === "pdf" 
                       ? "The comprehensive PDF guide for this section is ready for your review. Deep dive into the core concepts and case studies."
                       : "Listen to the detailed breakdown of this chapter. High-fidelity audio content tailored for focused learning."}
                  </p>
                  <Button size="lg" className="bg-indigo-950 dark:bg-primary text-white rounded-2xl px-12 h-16 font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-950/20 group hover:scale-105 transition-all">
                     {activeChapter?.content_type === "pdf" ? "Open Document Viewer" : "Start Audio Session"}
                     <Play className="w-4 h-4 ml-3 fill-current group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </motion.div>
         </div>
      </main>
    </div>
  );
}
