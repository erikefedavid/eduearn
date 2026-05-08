"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  ChevronLeft, ChevronRight, CheckCircle, 
  Menu, FileText, Headphones, Lock, PlayCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ChapterPlayerPage({ params }: { params: { courseId: string, chapterId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCourse(data);
        
        const currentChapter = data.chapters?.find((c: any) => c.id === params.chapterId);
        setChapter(currentChapter);
      } catch (error) {
        toast.error("Error loading chapter");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.courseId, params.chapterId]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading player...</div>;
  if (!course || !chapter) return <div className="flex h-screen items-center justify-center">Content not found.</div>;

  const currentIdx = course.chapters.findIndex((c: any) => c.id === params.chapterId);
  const nextChapter = course.chapters[currentIdx + 1];
  const prevChapter = course.chapters[currentIdx - 1];

  const onComplete = () => {
    toast.success("Chapter marked as complete!");
    if (nextChapter) {
      router.push(`/courses/${params.courseId}/chapters/${nextChapter.id}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-slate-200 flex flex-col shadow-xl z-20"
          >
            <div className="p-6 border-b border-slate-100 bg-indigo-950 text-white">
              <h2 className="text-xl font-bold font-heading line-clamp-2">{course.title}</h2>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                  <span>Course Progress</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-1.5 bg-white/10" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {course.chapters.map((c: any, idx: number) => {
                const isActive = c.id === params.chapterId;
                const isLocked = false; // Mock enrollment logic
                
                return (
                  <button
                    key={c.id}
                    disabled={isLocked}
                    onClick={() => router.push(`/courses/${params.courseId}/chapters/${c.id}`)}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${
                      isActive 
                        ? "bg-indigo-50 border border-indigo-100 shadow-sm" 
                        : "hover:bg-slate-50 border border-transparent"
                    } ${isLocked ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${isActive ? "text-indigo-950" : "text-slate-600"}`}>
                        {c.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {c.content_type === "pdf" ? <FileText className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                          {c.content_type}
                        </span>
                      </div>
                    </div>
                    {isActive && <PlayCircle className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl text-slate-500">
              <Menu className="w-6 h-6" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="hidden md:block">
               <h3 className="text-lg font-bold text-indigo-950 font-heading truncate max-w-md">
                 {chapter.title}
               </h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/courses/${params.courseId}`)} className="text-slate-500 font-bold text-xs uppercase tracking-widest">
              Exit Player
            </Button>
            <Button 
              onClick={onComplete}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl px-6 font-bold shadow-lg shadow-indigo-500/20"
            >
              Complete & Next
            </Button>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-5xl flex-1 flex flex-col">
            
            {/* Player Wrapper */}
            <div className="flex-1 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative flex flex-col mb-8 min-h-[500px]">
               {chapter.content_type === "pdf" ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                    <div className="bg-blue-100 p-8 rounded-[2rem] mb-6">
                       <FileText className="w-16 h-16 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Course Document: {chapter.title}</h2>
                    <p className="text-slate-500 max-w-md mb-8">
                       This chapter contains a PDF resource. You can view it below or download it for offline study.
                    </p>
                    {/* Placeholder for PDF Viewer */}
                    <div className="w-full aspect-[4/5] bg-white border border-slate-200 rounded-2xl flex items-center justify-center">
                       <Button size="lg" className="bg-indigo-600 text-white rounded-xl">View PDF Resource</Button>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-indigo-50/50">
                    <div className="relative">
                      <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                         <Headphones className="w-20 h-20 text-indigo-600" />
                      </div>
                      <div className="absolute -top-4 -right-4 bg-violet-600 text-white p-3 rounded-2xl shadow-xl">
                         <PlayCircle className="w-8 h-8" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-indigo-950 mt-12 mb-4 font-heading">{chapter.title}</h2>
                    <p className="text-slate-500 mb-12">Listen to this audio lecture to gain deep insights into the topic.</p>
                    
                    {/* Mock Audio Player */}
                    <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
                       <Progress value={30} className="h-2 bg-indigo-50 mb-6" />
                       <div className="flex items-center justify-center gap-8">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><ChevronLeft className="w-8 h-8" /></button>
                          <button className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/40"><PlayCircle className="w-8 h-8" /></button>
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight className="w-8 h-8" /></button>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pb-12">
               <Button 
                variant="outline" 
                disabled={!prevChapter}
                onClick={() => router.push(`/courses/${params.courseId}/chapters/${prevChapter.id}`)}
                className="rounded-xl px-6 h-12 font-bold border-slate-200 text-slate-600"
               >
                 <ChevronLeft className="w-4 h-4 mr-2" /> Previous Chapter
               </Button>
               <Button 
                variant="outline" 
                disabled={!nextChapter}
                onClick={() => router.push(`/courses/${params.courseId}/chapters/${nextChapter.id}`)}
                className="rounded-xl px-6 h-12 font-bold border-slate-200 text-slate-600"
               >
                 Next Chapter <ChevronRight className="w-4 h-4 ml-2" />
               </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
