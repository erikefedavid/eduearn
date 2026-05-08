"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Save, 
  FileText, 
  Headphones, 
  Upload,
  Globe,
  Lock,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";

export default function ChapterEditPage({ params }: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { courseId, chapterId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();

      if (!data) {
        router.push(`/instructor/courses/${courseId}`);
        return;
      }

      setChapter(data);
      setLoading(false);
    }
    loadData();
  }, [chapterId, courseId, router, supabase]);

  const onSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('chapters')
        .update({ 
          title: chapter.title,
          content_type: chapter.content_type,
          description: chapter.description
        })
        .eq('id', chapterId);

      if (error) throw error;
      toast.success("Chapter updated!");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role="instructor" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/instructor/courses/${courseId}`)} className="rounded-xl">
               <ChevronLeft className="w-6 h-6 text-slate-400" />
            </Button>
            <div>
               <h1 className="text-xl font-bold text-foreground font-heading">Edit Chapter</h1>
               <div className="text-[10px] font-black uppercase tracking-widest text-primary">Module Content</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" className="rounded-xl font-bold text-slate-400 h-12 px-6">
                <Eye className="w-4 h-4 mr-2" /> Preview
             </Button>
             <Button 
               onClick={onSave}
               disabled={isSaving}
               className="btn-gradient text-white rounded-xl px-8 font-bold h-12 gap-2 shadow-lg shadow-primary/20"
             >
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
             </Button>
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           <div className="max-w-4xl mx-auto py-10 space-y-12">
              
              {/* Title & Type */}
              <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Chapter Title</label>
                    <input 
                      type="text" 
                      value={chapter.title}
                      onChange={(e) => setChapter({ ...chapter, title: e.target.value })}
                      className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary/10 text-xl font-bold text-foreground transition-all"
                      placeholder="e.g. Introduction to Nigerian Tax Law"
                    />
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Content Type</label>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => setChapter({ ...chapter, content_type: 'pdf' })}
                            className={`flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${chapter.content_type === 'pdf' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                          >
                             <FileText className="w-8 h-8 mb-2" />
                             <span className="text-[10px] font-black uppercase tracking-widest">PDF Document</span>
                          </button>
                          <button 
                            onClick={() => setChapter({ ...chapter, content_type: 'audio' })}
                            className={`flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${chapter.content_type === 'audio' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                          >
                             <Headphones className="w-8 h-8 mb-2" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Audio Lecture</span>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Access Level</label>
                       <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="p-2 bg-white rounded-xl"><Globe className="w-4 h-4 text-green-500" /></div>
                             <div className="text-xs font-bold text-foreground">Free Preview</div>
                             <input type="checkbox" className="ml-auto w-5 h-5 rounded-lg text-primary focus:ring-primary" />
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="p-2 bg-white rounded-xl"><Lock className="w-4 h-4 text-secondary" /></div>
                             <div className="text-xs font-bold text-foreground">Enrolled Only</div>
                             <input type="checkbox" checked readOnly className="ml-auto w-5 h-5 rounded-lg text-secondary" />
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Upload Section */}
              <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
                 <h3 className="text-lg font-bold text-foreground font-heading mb-6">Chapter Resource</h3>
                 <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all cursor-pointer bg-slate-50/50">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                       <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Upload your {chapter.content_type.toUpperCase()}</h4>
                    <p className="text-slate-400 text-sm max-w-xs mb-8">Drag and drop your file here, or click to browse. Max size 50MB.</p>
                    <Button variant="outline" className="rounded-xl px-10 h-14 font-black text-xs uppercase tracking-widest border-slate-200">Choose File</Button>
                 </div>
              </section>

              {/* Description */}
              <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-6">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Chapter Summary</label>
                 <textarea 
                   value={chapter.description || ''}
                   onChange={(e) => setChapter({ ...chapter, description: e.target.value })}
                   className="w-full min-h-[200px] p-8 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary/10 text-lg font-medium text-foreground transition-all resize-none"
                   placeholder="Provide a brief overview of what students will learn in this chapter..."
                 />
              </section>

           </div>
        </div>
      </main>
    </div>
  );
}
