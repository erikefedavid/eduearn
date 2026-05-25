"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Play, 
  Pause,
  FileText, 
  Headphones, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  Download,
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapter, setActiveChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    async function loadCourseContent() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // 2. Fetch Course and Chapters
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      // 3. Verify Access (Enrollment OR Instructor/Admin)
      const isInstructorForCourse = courseData?.instructor_id === user.id;
      const isAdmin = profile?.is_admin;

      if (!isInstructorForCourse && !isAdmin) {
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
      }

      setIsEnrolled(true);

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

      // Load progress from local storage for seamless MVP tracking
      const storedProgress = localStorage.getItem(`progress_${courseId}`);
      if (storedProgress) {
        setCompletedChapters(JSON.parse(storedProgress));
      }

      setLoading(false);
    }
    loadCourseContent();
  }, [courseId, router, supabase]);

  // Audio Handlers
  useEffect(() => {
    // Reset audio player when active chapter changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [activeChapter]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    toast.success("Audio lecture finished!");
  };

  const handleScrub = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleSpeedChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  const skipTime = (amount: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += amount;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Derive Type Dynamically based on file extension
  const getContentType = (chap: any) => {
    if (!chap?.video_url) return "pdf";
    const ext = chap.video_url.split('.').pop()?.toLowerCase();
    if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext || '')) return "audio";
    return "pdf";
  };

  const getFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-content/${url}`;
  };

  const handleCompleteChapter = () => {
    if (!activeChapter) return;
    let nextCompleted = [...completedChapters];
    if (!nextCompleted.includes(activeChapter.id)) {
      nextCompleted.push(activeChapter.id);
      setCompletedChapters(nextCompleted);
      localStorage.setItem(`progress_${courseId}`, JSON.stringify(nextCompleted));
      toast.success("Module marked as complete! Academic excellence! 🎉");
    } else {
      nextCompleted = nextCompleted.filter(id => id !== activeChapter.id);
      setCompletedChapters(nextCompleted);
      localStorage.setItem(`progress_${courseId}`, JSON.stringify(nextCompleted));
      toast.info("Module completion removed.");
    }
  };

  const getProgressPercent = () => {
    if (chapters.length === 0) return 0;
    return Math.round((completedChapters.length / chapters.length) * 100);
  };

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

  const activeContentType = getContentType(activeChapter);

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
               <div className="text-xs font-bold text-foreground truncate max-w-[150px]">{course?.title}</div>
            </div>
         </div>

         {/* Sidebar Progress Tracker */}
         <div className="px-8 py-6 border-b border-border bg-muted/10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
               <span>Course Progress</span>
               <span className="text-primary">{getProgressPercent()}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary rounded-full transition-all duration-500" 
                 style={{ width: `${getProgressPercent()}%` }}
               />
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {chapters.map((chapter, index) => {
              const type = getContentType(chapter);
              const isCompleted = completedChapters.includes(chapter.id);
              return (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter)}
                  className={`w-full p-6 rounded-3xl flex items-center gap-4 text-left transition-all group ${
                    activeChapter?.id === chapter.id 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.01]" 
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
                         {type === "pdf" ? <FileText className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                         {type.toUpperCase()}
                      </div>
                   </div>
                   {isCompleted && (
                     <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${activeChapter?.id === chapter.id ? "text-white" : "text-primary"}`} />
                   )}
                </button>
              );
            })}
         </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
         <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between transition-colors duration-500 z-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {activeContentType === "pdf" ? <FileText className="w-5 h-5 text-primary" /> : <Headphones className="w-5 h-5 text-primary" />}
               </div>
               <h2 className="text-xl font-black text-foreground font-heading">{activeChapter?.title}</h2>
            </div>
            
            <div className="flex items-center gap-4">
               {activeChapter?.video_url && (
                 <a href={getFileUrl(activeChapter.video_url)} download target="_blank" rel="noreferrer">
                   <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-border text-muted-foreground gap-2 h-12">
                      <Download className="w-4 h-4" /> Download
                   </Button>
                 </a>
               )}
               
               <Button 
                 onClick={handleCompleteChapter}
                 className={`${completedChapters.includes(activeChapter?.id || "") ? "bg-muted text-muted-foreground" : "bg-primary text-white shadow-lg shadow-primary/20"} rounded-xl px-8 font-black h-12 gap-2 transition-all`}
               >
                  {completedChapters.includes(activeChapter?.id || "") ? "Mark Incomplete" : "Complete Lesson"} 
                  <CheckCircle2 className="w-4 h-4" />
               </Button>
            </div>
         </header>

         {/* Immersive Players */}
         <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center">
            {activeChapter?.video_url ? (
              activeContentType === "pdf" ? (
                /* Dynamic Interactive PDF Iframe Viewer */
                <div className="w-full max-w-5xl h-full rounded-[3.5rem] border border-border shadow-2xl overflow-hidden bg-card flex flex-col transition-colors">
                  <div className="h-14 bg-muted/30 border-b border-border px-8 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Scholarly PDF Manuscript
                     </span>
                     <Badge className="bg-primary/15 text-primary border-none">Secure Document Reader</Badge>
                  </div>
                  <div className="flex-1 bg-muted relative">
                     <iframe 
                       src={`${getFileUrl(activeChapter.video_url)}#toolbar=0`} 
                       className="w-full h-full border-none"
                     />
                  </div>
                </div>
              ) : (
                /* Premium Dynamic Waveform Audio Player */
                <div className="w-full max-w-3xl aspect-[16/10] bg-card rounded-[4rem] border border-border shadow-2xl shadow-primary/5 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden transition-colors">
                   {/* Background ambiance blobs */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                   <audio 
                     ref={audioRef}
                     src={getFileUrl(activeChapter.video_url)}
                     onTimeUpdate={handleTimeUpdate}
                     onLoadedMetadata={handleLoadedMetadata}
                     onEnded={handleAudioEnded}
                   />

                   <div className="relative z-10 w-full flex flex-col items-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-secondary/15 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-secondary/10">
                         <Headphones className="w-10 h-10 text-secondary" />
                      </div>
                      
                      <h3 className="text-2xl font-black text-foreground font-heading mb-2 tracking-tight">
                         Expert Audio Lecture
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto mb-8 line-clamp-2">
                         {activeChapter?.description || "Enjoy this premium tailored audio recording for deep knowledge discovery."}
                      </p>

                      {/* Animated wave bars when playing */}
                      <div className="flex items-center justify-center gap-1.5 h-12 mb-8 w-64">
                         {[1.2, 2.5, 3.8, 1.5, 4.2, 2.0, 3.1, 1.4, 2.8, 1.9, 3.5, 1.1].map((val, i) => (
                           <motion.div 
                             key={i}
                             animate={isPlaying ? {
                               height: ["12px", `${val * 12}px`, "12px"]
                             } : {
                               height: "12px"
                             }}
                             transition={{
                               repeat: Infinity,
                               duration: 0.8,
                               delay: i * 0.06
                             }}
                             className={`w-1.5 rounded-full ${isPlaying ? "bg-primary" : "bg-muted-foreground/30"}`}
                           />
                         ))}
                      </div>

                      {/* Timeline scrubbing */}
                      <div className="w-full space-y-2 mb-8">
                         <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                         </div>
                         <input 
                           type="range"
                           min={0}
                           max={duration || 100}
                           value={currentTime}
                           onChange={(e) => handleScrub(parseFloat(e.target.value))}
                           className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted accent-primary focus:outline-none"
                         />
                      </div>

                      {/* Main Audio Controls */}
                      <div className="flex items-center gap-6 mb-8">
                         <button 
                           onClick={() => skipTime(-10)}
                           className="w-10 h-10 rounded-xl bg-muted/40 border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                           title="Rewind 10s"
                         >
                            <RotateCcw className="w-4 h-4" />
                         </button>
                         
                         <button 
                           onClick={togglePlay}
                           className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                         >
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                         </button>

                         <button 
                           onClick={() => skipTime(10)}
                           className="w-10 h-10 rounded-xl bg-muted/40 border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                           title="Fast Forward 10s"
                         >
                            <FastForward className="w-4 h-4" />
                         </button>
                      </div>

                      {/* Speed & Volume Drawer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-6 border-t border-border gap-6">
                         {/* Playback speed options */}
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2">Speed</span>
                            {[1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handleSpeedChange(rate)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${playbackRate === rate ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                              >
                                 {rate}x
                              </button>
                            ))}
                         </div>

                         {/* Sound volume control */}
                         <div className="flex items-center gap-3 w-40">
                            <button onClick={toggleMute} className="text-muted-foreground hover:text-primary transition-colors">
                               {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input 
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={isMuted ? 0 : volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-full h-1 bg-muted rounded-full appearance-none accent-primary cursor-pointer"
                            />
                         </div>
                      </div>

                   </div>
                </div>
              )
            ) : (
              /* Resource Missing Placeholder */
              <motion.div 
                key={activeChapter?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl aspect-video bg-card rounded-[4rem] border border-border shadow-2xl shadow-primary/5 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden transition-colors"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                 
                 <div className="relative z-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-amber-500/10 flex items-center justify-center mx-auto mb-8 text-amber-500">
                       <Lock className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground font-heading mb-4 tracking-tight">
                       Content Unreleased
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto leading-relaxed mb-6">
                       Your instructor is currently preparing the high-fidelity {activeContentType.toUpperCase()} module for this chapter. Check back shortly.
                    </p>
                    <Badge variant="outline" className="border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground py-1 px-4">
                       Module: {activeChapter?.title}
                    </Badge>
                 </div>
              </motion.div>
            )}
         </div>
      </main>
    </div>
  );
}
