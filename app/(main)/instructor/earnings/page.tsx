"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  DollarSign,
  Download,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/loading-screen";

export default function EarningsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [earningsData, setEarningsData] = useState<any>({
    total: 85200.50,
    available: 12450.50,
    pending: 5000.00,
    history: [
      { id: 1, type: "Course Sale", course: "Advanced Nigerian Tax Law", date: "2024-11-28", amount: 4500.00, status: "completed" },
      { id: 2, type: "Course Sale", course: "Data Analytics for Business", date: "2024-11-25", amount: 6000.00, status: "completed" },
      { id: 3, type: "Payout", course: null, date: "2024-11-15", amount: -15000.00, status: "processed" },
      { id: 4, type: "Course Sale", course: "Renewable Energy Systems", date: "2024-11-10", amount: 3500.00, status: "completed" },
    ]
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
      setTimeout(() => setLoading(false), 800);
    }
    loadData();
  }, [supabase]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role="instructor" isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">Earnings & Payouts</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Financial Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="rounded-xl font-bold border-border text-muted-foreground px-6 h-12 hover:bg-muted transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export Report
             </Button>
             <Button className="btn-gradient text-white rounded-xl px-8 font-black h-12 gap-2 shadow-lg shadow-primary/20">
                <Wallet className="w-4 h-4" /> Request Payout
             </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-6xl mx-auto space-y-10">
              
              {/* Financial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <FinancialCard 
                    title="Total Revenue" 
                    value={`₦${earningsData.total.toLocaleString()}`} 
                    subtitle="Lifetime academic earnings"
                    icon={<TrendingUp className="w-6 h-6 text-primary" />}
                 />
                 <FinancialCard 
                    title="Available for Payout" 
                    value={`₦${earningsData.available.toLocaleString()}`} 
                    subtitle="Ready for withdrawal"
                    isHighlight
                    icon={<Wallet className="w-6 h-6 text-secondary" />}
                 />
                 <FinancialCard 
                    title="Pending Clearance" 
                    value={`₦${earningsData.pending.toLocaleString()}`} 
                    subtitle="Processing time: 3-5 days"
                    icon={<AlertCircle className="w-6 h-6 text-muted-foreground/30" />}
                 />
              </div>

              {/* Transactions Table */}
              <div className="bg-card rounded-[3rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                       <h2 className="text-2xl font-black text-foreground font-heading">Transaction History</h2>
                       <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest transition-colors">Recent financial activities</p>
                    </div>
                    <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border transition-colors">
                       <Button variant="ghost" className="rounded-xl bg-card text-primary text-[10px] font-black uppercase tracking-widest px-6 h-10 shadow-sm border border-border/50">All</Button>
                       <Button variant="ghost" className="rounded-xl text-muted-foreground text-[10px] font-black uppercase tracking-widest px-6 h-10 hover:text-foreground">Sales</Button>
                       <Button variant="ghost" className="rounded-xl text-muted-foreground text-[10px] font-black uppercase tracking-widest px-6 h-10 hover:text-foreground">Payouts</Button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {earningsData.history.map((tx: any) => (
                      <TransactionRow key={tx.id} tx={tx} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function FinancialCard({ title, value, subtitle, icon, isHighlight }: any) {
  return (
    <div className={`bg-card p-10 rounded-[3rem] border transition-all duration-500 ${isHighlight ? 'border-secondary/20 shadow-2xl shadow-secondary/5' : 'border-border shadow-xl shadow-primary/5'}`}>
       <div className="flex justify-between items-start mb-10">
          <div className={`p-5 rounded-[2rem] transition-colors ${isHighlight ? 'bg-secondary/5' : 'bg-muted/50'}`}>{icon}</div>
          {isHighlight && (
             <Badge className="bg-secondary/10 text-secondary border-0 font-black text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 shadow-sm">Priority</Badge>
          )}
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2 transition-colors">{title}</div>
       <div className={`text-4xl font-black font-heading mb-4 tracking-tighter ${isHighlight ? 'text-secondary' : 'text-foreground'}`}>{value}</div>
       <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest transition-colors">{subtitle}</p>
    </div>
  );
}

function TransactionRow({ tx }: any) {
  const isPayout = tx.amount < 0;
  
  return (
    <div className="flex items-center justify-between p-6 bg-muted/20 rounded-[2rem] border border-border/50 hover:bg-muted/40 transition-all group">
       <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isPayout ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
             {isPayout ? <ArrowUpRight className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
          </div>
          <div>
             <div className="text-base font-black text-foreground mb-1 transition-colors">
                {tx.type} {tx.course && <span className="text-muted-foreground font-bold opacity-60">— {tx.course}</span>}
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 transition-colors">
                <Calendar className="w-3 h-3" /> {tx.date}
             </div>
          </div>
       </div>
       <div className="text-right">
          <div className={`text-xl font-black font-heading ${isPayout ? 'text-foreground' : 'text-primary'}`}>
             {isPayout ? '-' : '+'} ₦{Math.abs(tx.amount).toLocaleString()}
          </div>
          <Badge className={`bg-transparent border-0 p-0 text-[10px] font-black uppercase tracking-[0.2em] ${tx.status === 'completed' || tx.status === 'processed' ? 'text-primary' : 'text-secondary'}`}>
             {tx.status}
          </Badge>
       </div>
    </div>
  );
}
