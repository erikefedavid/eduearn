"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Zap, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Check if user is admin for direct redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      toast.success("Logged in successfully!");
      
      if (profile?.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
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
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-foreground font-heading mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-medium transition-colors">Continue your scholarly journey on EduEarn</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                <button type="button" onClick={() => toast.success("Password reset link sent to your email.")} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline cursor-pointer">Forgot?</button>
              </div>
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
              className="w-full h-14 rounded-2xl btn-gradient text-white font-black text-lg shadow-xl shadow-primary/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground font-medium text-sm mb-4 transition-colors">Don't have an account?</p>
            <Link href="/signup">
               <Button variant="outline" className="w-full h-14 rounded-2xl border-border text-foreground font-bold hover:bg-muted transition-colors">
                 Create Free Account
               </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
