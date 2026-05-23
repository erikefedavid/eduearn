"use client";

import { use, useEffect, useState, useRef } from "react";
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
  Eye,
  Loader2,
  CheckCircle2
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Derive initial content_type for client visual selector
      let derivedType = "pdf";
      if (data.video_url) {
        const ext = data.video_url.split('.').pop()?.toLowerCase();
        if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext || '')) {
          derivedType = "audio";
        }
      }

      setChapter({
        ...data,
        content_type: derivedType
      });
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
          description: chapter.description,
          is_free: chapter.is_free || false
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);
      formData.append("chapterId", chapterId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      
      // Update local state & derive type
      const ext = url.split('.').pop()?.toLowerCase();
      const derivedType = ['mp3', 'wav', 'm4a', 'ogg'].includes(ext || '') ? "audio" : "pdf";
      
      setChapter((prev: any) => ({
        ...prev,
        video_url: url,
        content_type: derivedType
      }));

      // Update in database immediately
      const { error } = await supabase
        .from("chapters")
        .update({ video_url: url })
        .eq("id", chapterId);

      if (error) throw error;
      toast.success("File uploaded and linked successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role="instructor" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/instructor/courses/${courseId}`)} className="rounded-xl">
               <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </Button>
            <div>
               <h1 className="text-xl font-bold text-foreground font-heading">Edit Chapter</h1>
               <div className="text-[10px] font-black uppercase tracking-widest text-primary">Module Content</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button onClick={() => router.push(`/my-learning/${courseId}`)} variant="ghost" className="rounded-xl font-bold text-muted-foreground h-12 px-6">
                <Eye className="w-4 h-4 mr-2" /> Preview Player
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
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-4xl mx-auto py-10 space-y-12">
              
              {/* Title & Type */}
              <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 space-y-8 transition-colors">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Chapter Title</label>
                    <input 
                      type="text" 
                      value={chapter.title}
                      onChange={(e) => setChapter({ ...chapter, title: e.target.value })}
                      className="w-full h-16 px-8 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-xl font-bold text-foreground transition-all outline-none"
                      placeholder="e.g. Introduction to Nigerian Tax Law"
                    />
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Content Type</label>
                       <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => setChapter({ ...chapter, content_type: 'pdf' })}
                            className={`flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${chapter.content_type === 'pdf' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/20 text-muted-foreground'}`}
                          >
                             <FileText className="w-8 h-8 mb-2" />
                             <span className="text-[10px] font-black uppercase tracking-widest">PDF Document</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setChapter({ ...chapter, content_type: 'audio' })}
                            className={`flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${chapter.content_type === 'audio' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border bg-muted/20 text-muted-foreground'}`}
                          >
                             <Headphones className="w-8 h-8 mb-2" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Audio Lecture</span>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Access Level</label>
                       <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
                             <div className="p-2 bg-card rounded-xl border border-border"><Globe className="w-4 h-4 text-green-500" /></div>
                             <div className="text-xs font-bold text-foreground">Free Preview</div>
                             <input 
                               type="checkbox" 
                               checked={chapter.is_free || false}
                               onChange={(e) => setChapter({ ...chapter, is_free: e.target.checked })}
                               className="ml-auto w-5 h-5 rounded-lg text-primary focus:ring-primary cursor-pointer" 
                             />
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
                             <div className="p-2 bg-card rounded-xl border border-border"><Lock className="w-4 h-4 text-secondary" /></div>
                             <div className="text-xs font-bold text-foreground">Enrolled Only</div>
                             <input type="checkbox" checked readOnly className="ml-auto w-5 h-5 rounded-lg text-secondary" />
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Upload Section */}
              <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 transition-colors">
                 <h3 className="text-lg font-bold text-foreground font-heading mb-6">Chapter Resource</h3>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                   style={{ display: 'none' }} 
                   accept={chapter.content_type === 'pdf' ? '.pdf' : '.mp3,.wav,.m4a,.ogg'}
                 />
                 
                 <div 
                   onClick={triggerUpload}
                   className="border-2 border-dashed border-border rounded-[2rem] p-20 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all cursor-pointer bg-muted/20 relative overflow-hidden"
                 >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center">
                         <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                         <h4 className="text-xl font-bold text-foreground mb-2">Uploading resource...</h4>
                         <p className="text-muted-foreground text-sm max-w-xs">Connecting to secure academic database.</p>
                      </div>
                    ) : chapter.video_url ? (
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center shadow-sm mb-6 text-green-500">
                            <CheckCircle2 className="w-10 h-10" />
                         </div>
                         <h4 className="text-xl font-bold text-foreground mb-2">Resource Ready!</h4>
                         <p className="text-green-500 font-bold text-xs uppercase tracking-widest bg-green-500/10 px-4 py-1.5 rounded-full mb-4">
                            {chapter.content_type.toUpperCase()} LINKED
                         </p>
                         <p className="text-muted-foreground text-xs font-mono max-w-md truncate bg-background border border-border p-3 rounded-xl">
                            {chapter.video_url.split('/').pop()}
                         </p>
                          <Button variant="outline" onClick={triggerUpload} className="rounded-xl px-8 h-12 font-black text-[10px] uppercase tracking-widest border-border text-foreground hover:bg-muted mt-6">
                             Replace File
                          </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-card border border-border rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                           <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground mb-2">Upload your {chapter.content_type.toUpperCase()}</h4>
                        <p className="text-muted-foreground text-sm max-w-xs mb-8">Drag and drop your file here, or click to browse. Max size 50MB.</p>
                        <Button type="button" variant="outline" onClick={triggerUpload} className="rounded-xl px-10 h-14 font-black text-xs uppercase tracking-widest border-border">Choose File</Button>
                      </>
                    )}
                 </div>
              </section>

              {/* Description */}
              <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 space-y-6 transition-colors">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Chapter Summary</label>
                 <textarea 
                   value={chapter.description || ''}
                   onChange={(e) => setChapter({ ...chapter, description: e.target.value })}
                   className="w-full min-h-[200px] p-8 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-lg font-medium text-foreground transition-all resize-none outline-none bg-transparent"
                   placeholder="Provide a brief overview of what students will learn in this chapter..."
                 />
              </section>

           </div>
        </div>
      </main>
    </div>
  );
}
