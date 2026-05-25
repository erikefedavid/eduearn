"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Upload, 
  Layout, 
  FileText, 
  DollarSign, 
  ArrowRight,
  Plus,
  Trash2,
  Menu,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";

export default function CreateCoursePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    price: "",
    thumbnail_url: ""
  });

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a course title.");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a course description.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price greater than 0.");
      return false;
    }
    
    const urlStr = formData.thumbnail_url.trim();
    if (!urlStr) {
      toast.error("Please provide a thumbnail URL.");
      return false;
    }
    
    try {
      const parsedUrl = new URL(urlStr);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error();
      }
    } catch (_) {
      toast.error("Please provide a valid image URL starting with http:// or https://");
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (!validateStep2()) return;
    
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a course.");
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...formData,
          price: parseFloat(formData.price) || 0,
          instructor_id: user.id,
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Course created! Now add some content.");
      router.push(`/instructor/courses/${data.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role="instructor" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-muted transition-colors">
               <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </Button>
            <h1 className="text-2xl font-black text-foreground font-heading">Create New Course</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 mr-4">
                {[1, 2].map((s) => (
                   <div key={s} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${s <= step ? "bg-primary shadow-[0_0_10px_rgba(0,96,65,0.4)]" : "bg-muted"}`} />
                ))}
             </div>
             <Button variant="ghost" onClick={() => router.back()} className="font-bold text-muted-foreground hover:text-foreground">Cancel</Button>
             <Button 
               onClick={step === 1 ? () => { if (validateStep1()) setStep(2); } : onSubmit}
               disabled={loading}
               className="bg-primary text-white rounded-xl px-8 font-black h-12 shadow-xl shadow-primary/20 gap-2 hover:scale-[1.02] transition-all"
             >
                {step === 1 ? "Next Step" : loading ? "Creating..." : "Finish Course"}
                {step === 1 && <ArrowRight className="w-4 h-4" />}
             </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-4xl mx-auto py-10">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card rounded-[3rem] p-12 shadow-2xl shadow-primary/5 border border-border transition-colors duration-500"
              >
                 {step === 1 ? (
                   <div className="space-y-10">
                      <div>
                         <h2 className="text-3xl font-black text-foreground font-heading mb-2">Basic Information</h2>
                         <p className="text-muted-foreground font-medium transition-colors">Give your course a compelling title and description.</p>
                      </div>

                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Course Title</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Advanced Nigerian Tax Law"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full h-16 px-8 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold placeholder:text-muted-foreground/40 transition-all outline-none"
                            />
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Category</label>
                            <select 
                              value={formData.category}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              className="w-full h-16 px-8 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold appearance-none transition-all cursor-pointer outline-none"
                            >
                               <option>Technology</option>
                               <option>Law</option>
                               <option>Engineering</option>
                               <option>Medicine</option>
                               <option>Business</option>
                            </select>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Description</label>
                            <textarea 
                              placeholder="Describe what students will learn..."
                              rows={6}
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-8 rounded-[2rem] bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-medium placeholder:text-muted-foreground/40 transition-all outline-none"
                            />
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-10">
                      <div>
                         <h2 className="text-3xl font-black text-foreground font-heading mb-2">Pricing & Media</h2>
                         <p className="text-muted-foreground font-medium transition-colors">Set your price and upload a course thumbnail.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Course Price (₦)</label>
                            <div className="relative">
                               <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                               <input 
                                 type="number" 
                                 placeholder="e.g. 15000"
                                 value={formData.price}
                                 onChange={(e) => setFormData({...formData, price: e.target.value})}
                                 className="w-full h-16 pl-16 pr-8 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold placeholder:text-muted-foreground/40 transition-all outline-none"
                               />
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Course Thumbnail URL</label>
                            <input 
                              type="text" 
                              placeholder="Paste an Unsplash image URL"
                              value={formData.thumbnail_url}
                              onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                              className="w-full h-16 px-8 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-bold placeholder:text-muted-foreground/40 transition-all outline-none"
                            />
                         </div>
                      </div>

                      <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                         <div className="bg-card p-2 rounded-lg shadow-sm"><Zap className="w-4 h-4 text-primary" /></div>
                         <p className="text-foreground text-xs font-medium leading-relaxed">
                            <span className="font-black text-primary">Pro Tip:</span> Courses with professional thumbnails and detailed descriptions convert 3x better. Make sure your content reflects your expertise.
                         </p>
                      </div>
                   </div>
                 )}
              </motion.div>
           </div>
        </div>
      </main>
    </div>
  );
}
