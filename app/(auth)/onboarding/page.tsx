"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BookOpen, Presentation, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<"learner" | "instructor" | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // Check if already has a role other than default 'learner' (if we wanted to skip)
      // For now, we always let them pick
      setUser(user);
      setLoading(false);
    }
    checkUser();
  }, [router, supabase]);

  const handleComplete = async () => {
    if (!selectedRole) {
      toast.error("Please select a path to continue");
      return;
    }

    setSaving(true);
    try {
      // Update the profile with the selected role
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-foreground font-heading mb-4 tracking-tight">
            Welcome to EduEarn
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            How do you plan to use the platform?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Learner Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("learner")}
            className={`cursor-pointer rounded-[2.5rem] p-8 border-2 transition-all duration-300 relative overflow-hidden ${
              selectedRole === "learner"
                ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            {selectedRole === "learner" && (
              <div className="absolute top-6 right-6 text-primary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 text-primary">
              <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-foreground font-heading mb-4">I'm a Learner</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              I want to explore courses, acquire new skills, and track my academic progress.
            </p>
          </motion.div>

          {/* Instructor Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("instructor")}
            className={`cursor-pointer rounded-[2.5rem] p-8 border-2 transition-all duration-300 relative overflow-hidden ${
              selectedRole === "instructor"
                ? "border-secondary bg-secondary/5 shadow-2xl shadow-secondary/10"
                : "border-border bg-card hover:border-secondary/50"
            }`}
          >
            {selectedRole === "instructor" && (
              <div className="absolute top-6 right-6 text-secondary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mb-8 text-secondary">
              <Presentation className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-foreground font-heading mb-4">I'm an Instructor</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              I want to create courses, share my expertise, and manage my students and earnings.
            </p>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleComplete}
            disabled={!selectedRole || saving}
            className={`h-16 px-12 rounded-full font-black text-lg transition-all ${
              selectedRole === "learner" ? "bg-primary hover:bg-primary/90" : 
              selectedRole === "instructor" ? "bg-secondary hover:bg-secondary/90" : 
              "bg-muted text-muted-foreground"
            }`}
          >
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
            ) : null}
            Continue to Dashboard <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
