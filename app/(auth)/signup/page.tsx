"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Zap, Mail, Lock, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Auth Signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) throw error;

      toast.success("Account created! Please check your email or proceed to onboarding.");
      router.push("/onboarding");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 border border-border transition-colors">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-xl shadow-secondary/20 mb-6">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-foreground font-heading mb-2">Join EduEarn</h1>
            <p className="text-muted-foreground font-medium transition-colors">Start your academic empowerment journey</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Prof. John Doe"
                  required
                  className="pl-12 h-14 rounded-2xl border-border bg-muted/50 focus:bg-card focus:ring-primary transition-colors text-foreground"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="name@university.edu"
                  required
                  className="pl-12 h-14 rounded-2xl border-border bg-muted/50 focus:bg-card focus:ring-primary transition-colors text-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  className="pl-12 h-14 rounded-2xl border-border bg-muted/50 focus:bg-card focus:ring-primary transition-colors text-foreground"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-lg shadow-xl shadow-secondary/30 mt-4 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="mt-10 text-center border-t border-border pt-8">
            <p className="text-muted-foreground font-medium text-sm mb-4 transition-colors">Already have an account?</p>
            <Link href="/login">
               <span className="text-primary font-black uppercase tracking-widest text-xs hover:underline cursor-pointer">
                 Log In Instead
               </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
