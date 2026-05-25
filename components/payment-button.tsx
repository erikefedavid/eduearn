"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentButtonProps {
  courseId: string;
  amount: number;
  onSuccess?: () => void;
}

export const PaymentButton = ({ courseId, amount, onSuccess }: PaymentButtonProps) => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "",
    amount: amount * 100, // Paystack expects amount in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    metadata: {
      courseId,
      userId: user?.id,
      custom_fields: [
        {
          display_name: "Course ID",
          variable_name: "course_id",
          value: courseId
        },
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.id
        }
      ]
    }
  } as any;

  const initializePayment = usePaystackPayment(config);

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to enroll");
      return;
    }

    // Redirect to the immersive checkout simulation
    window.location.href = `/checkout/${courseId}`;
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !user}
      className="w-full h-16 rounded-2xl btn-gradient text-white text-lg font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all"
    >
      <CreditCard className="w-5 h-5 mr-2" />
      {amount === 0 ? "Enroll for Free" : `Buy Now for ₦${amount.toLocaleString()}`}
    </Button>
  );
};
