"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";
import { toast } from "sonner";

const DUMMY_INSTRUCTOR_COURSES = [
  {
    id: "demo-inst-1",
    title: "Nigerian Tax Law & Compliance",
    category: "Law",
    price: 15000,
    is_published: true,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "demo-inst-2",
    title: "Data Analytics with Python",
    category: "Technology",
    price: 25000,
    is_published: true,
    thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "demo-inst-3",
    title: "Renewable Energy Systems",
    category: "Engineering",
    price: 28000,
    is_published: false,
    thumbnail_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop",
  },
];

export default function InstructorCoursesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profileData) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      setCourses(data && data.length > 0 ? data : DUMMY_INSTRUCTOR_COURSES);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role="instructor" isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <h1 className="text-2xl font-black text-foreground font-heading">My Courses</h1>
          <Button onClick={() => router.push("/instructor/courses/new")} className="bg-primary text-white rounded-xl gap-2 font-black text-xs uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
             <Plus className="w-4 h-4" /> Create New Course
          </Button>
        </header>

        {/* Toolbar */}
        <div className="p-10 pb-0">
           <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-6 rounded-3xl border border-border shadow-xl shadow-primary/5 transition-colors duration-500">
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                 <input 
                   type="text" 
                   placeholder="Search your courses..." 
                   className="w-full h-12 pl-14 pr-6 bg-muted/30 border-0 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                 />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <Button variant="ghost" className="h-12 px-6 rounded-xl border border-border text-muted-foreground font-bold text-xs uppercase tracking-widest gap-2">
                    <Filter className="w-4 h-4" /> Filter
                 </Button>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           {courses.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-40 bg-card rounded-[4rem] border border-border shadow-xl shadow-primary/5 transition-colors duration-500">
                <div className="bg-muted p-10 rounded-[3rem] mb-10 transition-colors">
                   <BookOpen className="w-20 h-20 text-muted-foreground/20" />
                </div>
                <h2 className="text-2xl font-black text-foreground font-heading mb-4">No courses yet</h2>
                <p className="text-muted-foreground font-medium mb-10 max-w-md text-center transition-colors">
                   Ready to share your knowledge with the world? Create your first course and start earning.
                </p>
                <Button onClick={() => router.push("/instructor/courses/new")} size="lg" className="bg-primary text-white rounded-2xl px-12 h-16 font-black shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all">
                   Create Your First Course
                </Button>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {courses.map((course) => (
                  <CourseListItem key={course.id} course={course} />
                ))}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

function CourseListItem({ course }: { course: any }) {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card p-6 rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 hover:shadow-primary/15 transition-all flex flex-col md:flex-row items-center gap-8 transition-colors duration-500"
    >
       <div className="w-full md:w-48 aspect-video bg-muted rounded-3xl overflow-hidden relative border border-border transition-colors duration-500">
          {course.thumbnail_url ? (
            <Image 
              src={course.thumbnail_url} 
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 font-black text-xs uppercase tracking-widest">No Preview</div>
          )}
          <div className="absolute top-3 left-3 z-10">
             <Badge className={`border-0 font-bold ${course.is_published ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"}`}>
                {course.is_published ? "Published" : "Draft"}
             </Badge>
          </div>
       </div>

       <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{course.category}</div>
          <h3 className="text-xl font-black text-foreground font-heading truncate group-hover:text-primary transition-colors">{course.title}</h3>
          <div className="flex items-center gap-6 mt-4">
             <div className="flex items-center gap-2">
                <span className="text-xs font-black text-foreground">₦{course.price.toLocaleString()}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest transition-colors">Price</span>
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-border" />
             <div className="flex items-center gap-2">
                <span className="text-xs font-black text-foreground">0</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest transition-colors">Students</span>
             </div>
          </div>
       </div>

       <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/instructor/courses/${course.id}`)} className="rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
             <Edit className="w-5 h-5" />
          </Button>
          <Button size="lg" onClick={() => router.push(`/instructor/courses/${course.id}`)} className="bg-muted text-foreground rounded-2xl px-8 h-14 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-border group/btn shadow-sm">
             Manage Content <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
       </div>
    </motion.div>
  );
}
