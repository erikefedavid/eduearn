"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, PlayCircle, ShieldCheck, Zap, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/loading-screen";
import Link from "next/link";

const DUMMY_COURSES = [
  {
    id: "demo-1",
    title: "Nigerian Tax Law & Compliance",
    description: "Master the complexities of Nigerian tax regulations, FIRS guidelines, and corporate compliance strategies.",
    category: "Law",
    price: 15000,
    image_url: null,
    instructor: { full_name: "Adebayo Ogunleye" },
  },
  {
    id: "demo-2",
    title: "Data Analytics with Python",
    description: "Learn data wrangling, visualization, and machine learning fundamentals using Python and Pandas.",
    category: "Technology",
    price: 25000,
    image_url: null,
    instructor: { full_name: "Chidinma Eze" },
  },
  {
    id: "demo-3",
    title: "Petroleum Engineering Fundamentals",
    description: "Core principles of upstream oil and gas operations, reservoir management, and drilling technologies.",
    category: "Engineering",
    price: 30000,
    image_url: null,
    instructor: { full_name: "Yusuf Abubakar" },
  },
  {
    id: "demo-4",
    title: "Clinical Pharmacology",
    description: "Advanced pharmacokinetics, drug interactions, and evidence-based prescribing for healthcare professionals.",
    category: "Medicine",
    price: 35000,
    image_url: null,
    instructor: { full_name: "Ngozi Okonkwo" },
  },
  {
    id: "demo-5",
    title: "Entrepreneurship & Venture Capital",
    description: "Build scalable startups, pitch to investors, and navigate the African venture capital landscape.",
    category: "Business",
    price: 20000,
    image_url: null,
    instructor: { full_name: "Emeka Nwosu" },
  },
  {
    id: "demo-6",
    title: "Renewable Energy Systems",
    description: "Solar, wind, and hybrid energy solutions for Sub-Saharan Africa's power infrastructure challenges.",
    category: "Engineering",
    price: 28000,
    image_url: null,
    instructor: { full_name: "Fatima Bello" },
  },
];

export default function CourseCataloguePage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }

      const { data } = await supabase
        .from('courses')
        .select('*, instructor:instructor_id(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      setCourses(data || []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const categories = ["All", "Law", "Engineering", "Medicine", "Technology", "Business"];
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role={userProfile?.role || "learner"} isAdmin={userProfile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile-First Header */}
        <header className="h-auto min-h-[120px] bg-card border-b border-border px-6 md:px-12 py-6 flex flex-col lg:flex-row items-center justify-between gap-6 z-10 transition-colors duration-500">
           <div className="w-full lg:w-auto text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl font-black text-foreground font-heading tracking-tighter">Course Catalogue</h1>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary">Scholarly Excellence</p>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
              <div className="relative w-full group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   placeholder="Search courses, topics..." 
                   className="pl-16 h-14 md:h-16 rounded-2xl md:rounded-[2rem] border-border bg-muted/40 focus:bg-card focus:ring-primary/20 transition-all font-bold text-sm"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
               <button onClick={() => { const el = document.getElementById('category-pills'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="w-full md:w-auto h-14 md:h-16 px-8 rounded-2xl md:rounded-[2rem] bg-muted/40 border border-border flex items-center justify-center gap-3 hover:bg-muted/60 transition-colors">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Filter</span>
               </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background transition-colors duration-500 w-full">
           <div className="max-w-7xl mx-auto p-6 md:p-12 pb-40 lg:pb-32">
              
              {/* Category Pills - Scrollable on mobile */}
               <div id="category-pills" className="flex items-center gap-3 mb-10 md:mb-16 overflow-x-auto pb-4 no-scrollbar">
                 {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        selectedCategory === cat 
                          ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {cat}
                    </button>
                 ))}
              </div>

              {/* Course Grid - Smart stacking */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                 <AnimatePresence mode='popLayout'>
                    {filteredCourses.map((course, index) => (
                       <CatalogueCard key={course.id} course={course} index={index} />
                    ))}
                 </AnimatePresence>
              </div>

              {filteredCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
                   <Zap className="w-20 h-20 mb-6" />
                   <p className="text-xl font-black uppercase tracking-[0.5em]">No Assets Found</p>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}

function CatalogueCard({ course, index }: { course: any, index: number }) {
  const getFallbackImage = (category: string) => {
    const map: any = {
      "Technology": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
      "Law": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
      "Engineering": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
      "Medicine": "https://images.unsplash.com/photo-1505751172107-597d5a4d4b1b?q=80&w=2070&auto=format&fit=crop",
      "Business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      "default": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
    };
    return map[category] || map.default;
  };

  return (
    <Link href={`/courses/${course.id}`} className="block h-full group">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-8 border border-border shadow-xl shadow-primary/5 hover:shadow-primary/15 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full cursor-pointer overflow-hidden relative"
      >
         <div className="relative aspect-[16/10] bg-muted overflow-hidden rounded-2xl md:rounded-[2.5rem] mb-6 md:mb-8 border border-border/50">
            <img 
              src={course.image_url || getFallbackImage(course.category)} 
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-4 left-4">
               <Badge className="bg-primary text-white border-none rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg">
                  {course.category}
               </Badge>
            </div>
         </div>

         <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
               <div className="flex items-center text-amber-500/80"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
               <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">(4.9/5)</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-foreground font-heading group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] md:min-h-[3.5rem] leading-[1.2] tracking-tight">
               {course.title}
            </h3>
            <div className="flex items-center gap-3 pt-2">
               <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[10px] font-black border border-border">
                  {course.instructor?.full_name?.[0] || 'E'}
               </div>
               <div className="text-[10px] font-bold text-muted-foreground">Prof. {course.instructor?.full_name || "Expert"}</div>
            </div>
         </div>

         <div className="flex justify-between items-center border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 transition-colors">
            <div>
               <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 mb-1">Price</div>
               <div className="text-xl md:text-2xl font-black text-secondary font-heading tracking-tight">₦{course.price.toLocaleString()}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Enroll Now</span>
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-accent flex items-center justify-center text-white shadow-2xl shadow-primary/20 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <PlayCircle className="w-6 h-6 md:w-8 md:h-8" />
               </div>
            </div>
         </div>
      </motion.div>
    </Link>
  );
}
