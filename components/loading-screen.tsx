"use client";

import { Zap } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background transition-colors duration-500 overflow-hidden relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative mb-12">
           <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl animate-pulse" />
           <div className="relative w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 transform rotate-3 animate-bounce">
              <Zap className="text-white w-12 h-12" />
           </div>
           {/* Circling Ring */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-primary/20 rounded-full animate-[spin_8s_linear_infinite]" />
        </div>

        {/* Text Animation */}
        <div className="text-center">
           <h2 className="text-4xl font-black font-heading text-primary tracking-tighter mb-4 animate-pulse">
             EduEarn
           </h2>
           <div className="flex items-center gap-2 justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
           </div>
           <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">
             Scholarly Excellence is Loading
           </p>
        </div>
      </div>

      {/* Progress Line at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
         <div className="h-full bg-primary animate-[loading-bar_2s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; left: 0%; }
          50% { width: 40%; left: 30%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  );
}
