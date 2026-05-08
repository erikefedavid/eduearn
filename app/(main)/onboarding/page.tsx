"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        // Small delay for branding consistency
        setTimeout(() => setCheckingUser(false), 1000);
      }
    }
    checkUser();
  }, [router, supabase]);

  const selectRole = async (role: "learner" | "instructor") => {
    try {
      setLoading(role);
      
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error("Onboarding failed");

      toast.success(`Welcome aboard as a ${role}!`);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  if (checkingUser) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-500 theme-transition">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-foreground font-heading mb-4">
            Welcome to EduEarn
          </h1>
          <p className="text-muted-foreground text-lg font-medium transition-colors">
            To get started, please tell us how you plan to use the platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Learner Card */}
          <RoleCard
            title="I am a Learner"
            description="Browse courses, acquire high-demand skills, and earn verified certifications."
            icon={<GraduationCap className="w-12 h-12 text-primary" />}
            onClick={() => selectRole("learner")}
            isLoading={loading === "learner"}
            disabled={!!loading}
          />

          {/* Instructor Card */}
          <RoleCard
            title="I am an Instructor"
            description="Create high-quality courses, share your expertise, and earn extra revenue."
            icon={<Briefcase className="w-12 h-12 text-secondary" />}
            onClick={() => selectRole("instructor")}
            isLoading={loading === "learner"}
            disabled={!!loading}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({ title, description, icon, onClick, isLoading, disabled }: any) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="group relative bg-card rounded-[2.5rem] p-10 text-left border-border border shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="mb-8 p-6 bg-muted rounded-3xl group-hover:bg-primary/10 transition-colors duration-300 inline-block w-fit">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-8 flex-1 font-medium transition-colors duration-300">
        {description}
      </p>
      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
        {isLoading ? "Setting up..." : "Select Role"}
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Decorative Gradient Background on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-bl-[5rem] -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
    </motion.button>
  );
}
