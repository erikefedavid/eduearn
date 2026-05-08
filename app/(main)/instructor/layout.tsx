"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== "instructor") {
        router.push("/dashboard");
      } else {
        setIsInstructor(true);
      }
      setLoading(false);
    }
    checkRole();
  }, [router, supabase]);

  if (loading || !isInstructor) {
    return <div className="flex h-screen items-center justify-center">Verifying credentials...</div>;
  }

  return <>{children}</>;
}
