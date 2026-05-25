"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2,
  Loader2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";

export default function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to continue.");
        router.push("/login");
        return;
      }
      setUser(user);

      // Verify not already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        toast.info("You are already enrolled in this course.");
        router.push(`/my-learning/${courseId}`);
        return;
      }

      // Fetch course details
      const { data: courseData } = await supabase
        .from('courses')
        .select('*, instructor:instructor_id(full_name)')
        .eq('id', courseId)
        .single();

      if (!courseData) {
        toast.error("Course not found.");
        router.push("/courses");
        return;
      }

      setCourse(courseData);
      setLoading(false);
    }
    
    loadData();
  }, [courseId, router, supabase]);

  const handleConfirmPayment = async () => {
    setProcessing(true);
    
    try {
      // Step 1: Simulate network delay for realistic checkout feel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Trigger the actual verification API (which handles DB insert and balances)
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          reference: "SIMULATED_PAYMENT_" + Date.now(),
        }),
      });

      if (res.ok) {
        toast.success("Payment successful! Welcome to the course.", {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        });
        
        // Brief pause so the user can read the success toast
        setTimeout(() => {
          router.push(`/my-learning/${courseId}`);
        }, 1500);
      } else {
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setProcessing(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const subtotal = course.price;
  const platformFee = subtotal * 0.05; // 5% mock platform fee
  const total = subtotal + platformFee;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-[3rem] p-10 border border-border shadow-2xl shadow-primary/5"
        >
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl mb-8 -ml-4 text-muted-foreground hover:bg-muted">
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Order Summary</h2>
          <h1 className="text-3xl font-black text-foreground font-heading mb-10 tracking-tight leading-[1.1]">
            Complete Your Enrollment
          </h1>

          <div className="flex gap-6 items-center mb-10 p-4 rounded-3xl bg-muted/30 border border-border">
            <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden flex-shrink-0">
              {course.image_url ? (
                <img src={course.image_url} alt="Course" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  IMG
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight mb-2">{course.title}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Instructor: {course.instructor?.full_name || "Expert"}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8 border-b border-border pb-8">
            <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
              <span>Platform Fee (5%)</span>
              <span>₦{platformFee.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-widest text-foreground">Total Due</span>
            <span className="text-3xl font-black text-secondary tracking-tighter">₦{total.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Right Side: Payment Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[3rem] p-10 border border-border shadow-2xl shadow-primary/5 flex flex-col h-full justify-between"
        >
          <div>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground font-heading mb-4">Secure Checkout</h2>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-sm">
              Your payment is processed securely. By confirming this payment, you will gain immediate lifetime access to the course materials.
            </p>

            <div className="p-6 rounded-3xl bg-muted/40 border border-border mb-10 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-foreground">Bank-Level Security</p>
                <p className="text-xs font-medium text-muted-foreground mt-1">256-bit SSL encryption applied.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleConfirmPayment}
            disabled={processing}
            className="w-full h-20 rounded-[2rem] btn-gradient text-white text-xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {processing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                Pay ₦{total.toLocaleString()} <ArrowRight className="w-6 h-6 ml-2 opacity-50" />
              </>
            )}
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
