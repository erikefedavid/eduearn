"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  PlayCircle, 
  Star,
  Users,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";

export default function CourseCataloguePage() {
  const supabase = createClient();
  const categories = ["All", "Law", "Engineering", "Medicine", "Technology", "Business"];
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      // 2. Fetch Courses
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      setCourses(data || []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // Optimized Filtering logic using useMemo
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role="learner" isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">Course Catalogue</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Scholarly Excellence</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search courses, professors, topics..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-14 pr-6 bg-muted/50 border-0 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                />
             </div>
             <Button variant="outline" className="h-12 px-6 rounded-xl border-border text-muted-foreground gap-2 font-bold hover:bg-muted transition-colors">
                <Filter className="w-4 h-4" /> Filter
             </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-7xl mx-auto">
              {/* Category Pills */}
              <div className="flex items-center gap-4 mb-12 flex-wrap">
                 {categories.map((cat) => (
                   <Badge 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     variant={selectedCategory === cat ? "default" : "outline"}
                     className={`cursor-pointer px-6 py-2 rounded-full font-bold transition-all border-2 ${
                       selectedCategory === cat 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary bg-card"
                     }`}
                   >
                     {cat === "All" ? "All Courses" : cat}
                   </Badge>
                 ))}
              </div>

              {filteredCourses.length === 0 ? (
                <div className="py-40 text-center">
                   <div className="bg-card p-10 rounded-[3rem] w-fit mx-auto mb-8 border border-border shadow-xl shadow-primary/5 transition-colors">
                      <Search className="w-12 h-12 text-muted-foreground opacity-20" />
                   </div>
                   <h2 className="text-2xl font-black text-foreground font-heading mb-4">No results found</h2>
                   <p className="text-muted-foreground max-w-sm mx-auto font-medium transition-colors">Try adjusting your search or category filters.</p>
                   <Button 
                    variant="link" 
                    onClick={() => {setSelectedCategory("All"); setSearchQuery("");}}
                    className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest"
                   >
                     Reset Filters
                   </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                   {filteredCourses.map((course) => (
                     <Link key={course.id} href={`/courses/${course.id}`}>
                        <CatalogueCard course={course} />
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

function CatalogueCard({ course }: { course: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-[3.5rem] p-8 border border-border shadow-xl shadow-primary/5 hover:shadow-primary/15 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full cursor-pointer overflow-hidden relative"
    >
       <div className="aspect-video bg-muted rounded-[2.5rem] mb-8 overflow-hidden relative border border-border transition-colors">
          {course.thumbnail_url ? (
            <Image 
              src={course.thumbnail_url} 
              alt={course.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-black text-xs uppercase tracking-widest opacity-30">EduEarn Preview</div>
          )}
          <div className="absolute top-6 left-6 z-10">
             <Badge className="bg-primary text-white border-0 font-black text-[9px] uppercase tracking-[0.2em] shadow-xl px-4 py-1.5">{course.category}</Badge>
          </div>
       </div>

       <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
             <div className="flex items-center text-amber-500/80"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
             <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">(4.9/5)</span>
          </div>
          <h3 className="text-xl font-black text-foreground font-heading group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] leading-[1.2] tracking-tight">
             {course.title}
          </h3>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center transition-colors"><ShieldCheck className="w-4 h-4 text-primary" /></div>
             <div className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60">Verified Curriculum</div>
          </div>
       </div>

       <div className="flex justify-between items-center border-t border-border mt-8 pt-8 transition-colors">
          <div>
             <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 mb-1">Price</div>
             <div className="text-2xl font-black text-secondary font-heading tracking-tight">₦{course.price.toLocaleString()}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Enroll Now</span>
             <Button size="icon" className="w-16 h-16 rounded-[1.5rem] btn-gradient text-white shadow-2xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <PlayCircle className="w-8 h-8" />
             </Button>
          </div>
       </div>
    </motion.div>
  );
}
