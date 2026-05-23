"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Layout, 
  Plus, 
  Trash2, 
  GripVertical,
  FileText,
  Headphones,
  Save,
  Rocket,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";

export default function CourseEditPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "Technology",
    price: "",
    thumbnail_url: ""
  });

  useEffect(() => {
    async function loadData() {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (!courseData) {
        router.push("/instructor/courses");
        return;
      }

      const { data: chapterData } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      setCourse(courseData);
      setChapters(chapterData || []);
      setCourseForm({
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "Technology",
        price: courseData.price ? courseData.price.toString() : "",
        thumbnail_url: courseData.thumbnail_url || ""
      });
      setLoading(false);
    }
    loadData();
  }, [courseId, router, supabase]);

  const onAddChapter = async () => {
    try {
      const position = chapters.length + 1;
      const { data: newChapter, error } = await supabase
        .from('chapters')
        .insert({
          course_id: courseId,
          title: "New Chapter",
          content_type: "pdf",
          position
        })
        .select()
        .single();

      if (error) throw error;
      setChapters([...chapters, newChapter]);
      toast.success("Chapter added!");
    } catch (error) {
      toast.error("Failed to add chapter");
    }
  };

  const onDeleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;
      setChapters(chapters.filter(c => c.id !== chapterId));
      toast.success("Chapter deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chapter");
    }
  };

  const onPublish = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published })
        .eq('id', courseId);

      if (error) throw error;
      setCourse({ ...course, is_published: !course.is_published });
      toast.success(course.is_published ? "Course unpublished" : "Course published!");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseForm.title,
          description: courseForm.description,
          category: courseForm.category,
          price: parseFloat(courseForm.price) || 0,
          thumbnail_url: courseForm.thumbnail_url
        })
      });

      if (!res.ok) throw new Error("Failed to update settings");
      const updatedCourse = await res.json();
      setCourse(updatedCourse);
      setIsSettingsOpen(false);
      toast.success("Course settings updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition relative">
      <Sidebar role="instructor" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/instructor/courses")} className="rounded-xl hover:bg-muted transition-colors">
               <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </Button>
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-foreground font-heading truncate max-w-md">{course.title}</h1>
                  <Badge className={`border-0 font-bold ${course.is_published ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"}`}>
                     {course.is_published ? "Published" : "Draft"}
                  </Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Content Builder</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button onClick={() => setIsSettingsOpen(true)} variant="outline" className="rounded-xl font-bold border-border text-muted-foreground px-6 h-12 hover:bg-muted transition-colors">
                <Settings className="w-4 h-4 mr-2" /> Settings
             </Button>
             <Button 
               onClick={onPublish}
               disabled={isSaving}
               className={`${course.is_published ? "bg-muted text-muted-foreground" : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]"} rounded-xl px-8 font-black h-12 gap-2 transition-all`}
             >
                {course.is_published ? "Unpublish" : "Publish Course"}
                {!course.is_published && <Rocket className="w-4 h-4" />}
             </Button>
          </div>
        </header>

        {/* Content Builder */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-5xl mx-auto py-10">
              <div className="flex justify-between items-end mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-foreground font-heading mb-2">Curriculum</h2>
                    <p className="text-muted-foreground font-medium transition-colors">Add and organize your course chapters.</p>
                 </div>
                 <Button onClick={onAddChapter} className="bg-primary text-white rounded-xl gap-2 font-black text-xs uppercase tracking-widest px-6 h-12 shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all">
                    <Plus className="w-4 h-4" /> Add Chapter
                 </Button>
              </div>

              <div className="space-y-6">
                 {chapters.length === 0 ? (
                   <div className="bg-card rounded-[3.5rem] p-20 border-2 border-dashed border-border flex flex-col items-center justify-center text-center transition-colors duration-500">
                      <div className="bg-muted p-6 rounded-3xl mb-6"><Layout className="w-10 h-10 text-muted-foreground/20" /></div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Your curriculum is empty</h3>
                      <p className="text-muted-foreground max-w-sm mb-10 transition-colors">Start building your course by adding your first chapter. You can upload PDFs or Audio files.</p>
                      <Button onClick={onAddChapter} variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest border-border text-foreground hover:bg-muted">Get Started</Button>
                   </div>
                 ) : (
                   chapters.map((chapter, index) => (
                     <ChapterItem 
                       key={chapter.id} 
                       chapter={chapter} 
                       index={index} 
                       courseId={courseId}
                       onDelete={onDeleteChapter}
                     />
                   ))
                 )}
              </div>
           </div>
        </div>
      </main>

      {/* Premium Course Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-card border border-border w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl p-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
              <div>
                <h3 className="text-2xl font-black text-foreground font-heading">Course settings</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Modify academic asset metadata</p>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={onSaveSettings} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Course Title</label>
                <input 
                  type="text" 
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                  className="w-full h-14 px-6 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold outline-none"
                  placeholder="e.g. Advanced Tax Compliance"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Category</label>
                  <select 
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full h-14 px-6 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold outline-none cursor-pointer"
                  >
                    <option>Technology</option>
                    <option>Law</option>
                    <option>Engineering</option>
                    <option>Medicine</option>
                    <option>Business</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Price (₦)</label>
                  <input 
                    type="number" 
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    required
                    className="w-full h-14 px-6 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold outline-none"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Course Thumbnail URL</label>
                <input 
                  type="text" 
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                  className="w-full h-14 px-6 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold outline-none"
                  placeholder="Paste Unsplash image URL"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Description</label>
                <textarea 
                  rows={4}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full p-6 rounded-[2rem] bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-medium outline-none"
                  placeholder="Provide comprehensive details about this professional course..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-border mt-8">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsSettingsOpen(false)}
                  className="font-bold text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-primary text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterItem({ chapter, index, courseId, onDelete }: any) {
  const router = useRouter();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card p-6 rounded-3xl border border-border shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all flex items-center gap-6 group transition-colors duration-500"
    >
       <div className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors cursor-grab"><GripVertical className="w-5 h-5" /></div>
       <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-primary text-xs transition-colors">
          {index + 1}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
             <h4 className="text-lg font-black text-foreground font-heading truncate group-hover:text-primary transition-colors">{chapter.title}</h4>
             <Badge variant="outline" className="border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                {chapter.video_url && chapter.video_url.endsWith(".pdf") ? (
                  <>
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </>
                ) : (
                  <>
                    <Headphones className="text-muted-foreground/60 w-3 h-3 mr-1" /> Audio
                  </>
                )}
             </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground transition-colors">Section {index + 1} of the curriculum</p>
       </div>
       <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onDelete(chapter.id)} className="rounded-xl text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 transition-colors">
             <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push(`/instructor/courses/${courseId}/chapters/${chapter.id}`)} variant="outline" className="bg-muted/50 rounded-xl font-bold border-border text-foreground px-6 h-12 group/btn shadow-sm hover:bg-muted transition-all">
             Edit Content <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
       </div>
    </motion.div>
  );
}
