"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen, DollarSign, Users, Zap, PlayCircle, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoadingScreen } from "@/components/loading-screen";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navbarRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroImageRef = useRef(null);
  const statsRef = useRef(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef(null);
  const featuredCoursesRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setTimeout(() => setLoading(false), 2000);
    }
    checkUser();
  }, [supabase]);

  useEffect(() => {
    if (!loading) {
      setMounted(true);
    }
  }, [loading]);

  useEffect(() => {
    if (mounted) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      tl.fromTo(navbarRef.current, 
        { y: -100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, clearProps: "all" }
      );
      
      tl.fromTo(heroContentRef.current, 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1.2, clearProps: "all" },
        "-=0.5"
      );
      
      tl.fromTo(heroImageRef.current,
        { opacity: 0, scale: 0.9, x: 50 },
        { opacity: 1, scale: 1, x: 0, duration: 1.2, clearProps: "all" },
        "-=1"
      );

      tl.fromTo(statsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, clearProps: "all" },
        "-=0.8"
      );

      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        }
      });

      const sections = [howItWorksRef.current, featuredCoursesRef.current];
      sections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 50,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            end: "top 60%",
            scrub: 1,
          }
        });
      });

      if (blobsRef.current) {
        const blobs = blobsRef.current.children;
        gsap.to(blobs[0], {
          y: "40vh",
          x: "10vw",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        });
        gsap.to(blobs[1], {
          y: "-40vh",
          x: "-10vw",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        });
      }

      gsap.to(".floating", {
        y: 15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, [mounted]);


  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden theme-transition">
      <div 
        ref={progressBarRef} 
        className="fixed top-0 left-0 w-full h-1.5 bg-primary z-[100] origin-left scale-x-0 transition-colors shadow-[0_0_15px_rgba(0,96,65,0.6)]"
      />

      <div ref={blobsRef} className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[120px]" />
         <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <nav ref={navbarRef} className="fixed top-0 w-full z-50 glass border-b border-primary/10 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-primary font-heading">EduEarn</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors">
            <Link href="#how-it-works" className="hover:text-primary">How it Works</Link>
            <Link href="/courses" className="hover:text-primary">Browse Courses</Link>
            <Link href="/login" className="hover:text-primary">Become a Lecturer</Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block">
               <ThemeToggle />
            </div>
            {user ? (
              <Link href="/dashboard">
                <Button className="btn-gradient text-white rounded-xl px-6 md:px-8 font-bold h-10 md:h-12 text-xs">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden xs:block">
                  <Button variant="ghost" className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest px-4">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-gradient text-white rounded-xl px-6 md:px-8 font-bold h-10 md:h-12 text-xs transition-all active:scale-95 shadow-xl shadow-primary/10">Sign Up</Button>
                </Link>
              </>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-1.5 border border-border"
            >
              <div className={`w-5 h-0.5 bg-primary transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-5 h-0.5 bg-primary transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
              <div className={`w-5 h-0.5 bg-primary transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card/95 backdrop-blur-2xl border-b border-border overflow-hidden"
            >
              <div className="p-8 flex flex-col gap-6 font-black text-[10px] uppercase tracking-[0.3em] text-center">
                <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="py-4 hover:text-primary transition-colors border-b border-border/50">How it Works</Link>
                <Link href="/courses" onClick={() => setIsMenuOpen(false)} className="py-4 hover:text-primary transition-colors border-b border-border/50">Browse Courses</Link>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="py-4 hover:text-primary transition-colors border-b border-border/50">Become a Lecturer</Link>
                <div className="flex items-center justify-center gap-8 py-4">
                   <ThemeToggle />
                   <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground">Sign In</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative pt-48 pb-32">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div ref={heroContentRef}>
                <div className="inline-flex items-center bg-white/80 dark:bg-slate-900/50 border border-primary/10 mb-10 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.25em] uppercase text-primary shadow-sm backdrop-blur-sm transition-colors">
                   Scholarly Empowerment & Digital Prosperity
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-foreground leading-[0.9] mb-12 font-heading tracking-tighter">
                  Learn. Teach.<br />
                  <span className="text-secondary italic">Earn.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-16 font-medium max-w-xl">
                  Bridging the gap between traditional academic prestige and modern financial growth. 
                  Empowering Nigerian lecturers to share knowledge and students to master professional skills.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link href="/signup">
                    <Button size="lg" className="btn-gradient text-white rounded-xl px-16 h-20 text-2xl font-bold shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button size="lg" variant="outline" className="rounded-xl px-12 h-20 text-xl font-bold border-primary/20 text-primary hover:bg-white dark:hover:bg-slate-800 bg-transparent transition-all">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              </div>

              <div ref={heroImageRef} className="relative">
                 <div className="absolute inset-0 bg-primary/5 rounded-[4rem] -rotate-3 scale-105 -z-10" />
                 <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 floating transition-colors">
                    <Image 
                      src="/academic_hero_professor.png" 
                      alt="Expert Nigerian Lecturer"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute bottom-10 left-10 right-10 glass p-8 rounded-3xl border-white/40 dark:border-white/10 transition-colors">
                       <div className="flex items-center gap-4 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verified Professor</span>
                       </div>
                       <div className="text-xl font-bold text-foreground font-heading">Prof. Yusuf Abubakar</div>
                       <div className="text-xs text-muted-foreground font-medium italic">"Financial prosperity is the reward for shared excellence."</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section ref={statsRef} className="py-20 border-y border-primary/5 bg-white/50 dark:bg-slate-900/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
           <StatItem label="Active Students" value="12k+" />
           <StatItem label="Expert Lecturers" value="450+" />
           <StatItem label="Total Earnings" value="₦85M+" />
           <StatItem label="Course Categories" value="15+" />
        </div>
      </section>

      <section id="how-it-works" ref={howItWorksRef} className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
             <h2 className="text-5xl font-bold text-foreground font-heading mb-4 tracking-tight">The Path to Excellence</h2>
             <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Three simple steps to financial independence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <StepCard 
               num="01"
               title="Professional Profile"
               description="Create your profile as a student or verify your academic credentials as a lecturer."
               icon={<Users className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />}
            />
            <StepCard 
               num="02"
               title="Knowledge Exchange"
               description="Enroll in world-class courses or design your own curriculum with our intuitive builder."
               icon={<BookOpen className="w-8 h-8 text-secondary group-hover:text-white transition-colors duration-300" />}
            />
            <StepCard 
               num="03"
               title="Financial Growth"
               description="Receive automated weekly payouts for your course sales and grow your academic brand."
               icon={<DollarSign className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />}
            />
          </div>
        </div>
      </section>

      <footer className="py-24 bg-white dark:bg-slate-900 border-t border-primary/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-primary font-heading">EduEarn</span>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed italic">
                "Empowering Nigerian Academia through technology and financial growth."
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
               <FooterColumn title="Platform" links={["Browse Courses", "Become a Lecturer", "Affiliate Program"]} />
               <FooterColumn title="Support" links={["Help Center", "Privacy Policy", "Terms of Service"]} />
               <FooterColumn title="Contact" links={["Support@eduearn.ng", "Lagos, Nigeria"]} />
            </div>
          </div>
          <div className="pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">© 2026 EduEarn. Scholarly Excellence.</p>
            <div className="flex gap-8">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">LinkedIn</span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Twitter</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="text-center">
       <div className="text-4xl font-bold text-primary font-heading mb-2">{value}</div>
       <div className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground transition-colors">{label}</div>
    </div>
  );
}

function StepCard({ num, title, description, icon }: any) {
  return (
    <div className="step-card relative p-10 rounded-[2.5rem] bg-white dark:bg-card border border-primary/5 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03] transition-transform duration-300 ease-out will-change-transform group cursor-default">
       <div className="absolute -top-6 -right-6 text-7xl font-bold text-primary/5 select-none font-heading group-hover:text-primary/10 transition-colors duration-300">{num}</div>
       <div className="mb-10 p-6 bg-accent dark:bg-muted rounded-2xl w-fit group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-sm">{icon}</div>
       <h3 className="text-2xl font-bold text-foreground group-hover:text-primary mb-4 font-heading transition-colors duration-300">{title}</h3>
       <p className="text-muted-foreground group-hover:text-foreground font-medium leading-relaxed text-sm transition-colors duration-300">{description}</p>
    </div>
  );
}

function FooterColumn({ title, links }: any) {
  return (
    <div className="space-y-6">
       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{title}</h4>
       <ul className="space-y-4">
          {links.map((link: string) => (
             <li key={link}>
                <Link href="/courses" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">{link}</Link>
             </li>
          ))}
       </ul>
    </div>
  );
}
