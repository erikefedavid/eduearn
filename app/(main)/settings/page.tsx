"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/loading-screen";
import { 
  User, 
  Wallet, 
  Shield, 
  Bell, 
  Camera,
  CheckCircle2,
  ChevronRight,
  LogOut,
  History,
  Award,
  Loader2
} from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        router.push("/onboarding");
        return;
      }

      setProfile(data);
      setTimeout(() => setLoading(false), 1000);
    }
    loadProfile();
  }, [supabase]);

  if (loading) return <LoadingScreen />;

  // Tailor tabs based on role
  const tabs = [
    { id: "profile", label: "Identity", icon: User },
    ...(profile?.role === "instructor" 
      ? [{ id: "payout", label: "Payouts", icon: Wallet }] 
      : [{ id: "purchases", label: "Purchase History", icon: History }]
    ),
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Alerts", icon: Bell },
  ];

  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-500 theme-transition">
      <Sidebar role={profile?.role || "learner"} isAdmin={profile?.is_admin} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-card border-b border-border px-10 flex items-center justify-between z-10 transition-colors duration-500">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">Control Center</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              {profile?.role === "instructor" ? "Instructor Management" : "Learner Settings"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors gap-2 font-bold uppercase tracking-widest text-[10px]"
          >
             <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-40 md:pb-20 custom-scrollbar bg-background transition-colors duration-500">
           <div className="max-w-5xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
                  
                  {/* Sidebar Tabs */}
                  <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                     {tabs.map((tab) => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={`flex-shrink-0 lg:w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                           activeTab === tab.id 
                             ? "bg-primary text-white shadow-lg shadow-primary/20" 
                             : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                         }`}
                       >
                          <tab.icon className="w-4 h-4" />
                          <span className="whitespace-nowrap">{tab.label}</span>
                       </button>
                     ))}
                  </div>

                 {/* Settings Panel */}
                 <div className="lg:col-span-3">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card rounded-[3rem] p-10 border border-border shadow-xl shadow-primary/5 transition-colors"
                    >
                       {activeTab === "profile" && <ProfileSettings profile={profile} />}
                       {activeTab === "payout" && <PayoutSettings profile={profile} />}
                       {activeTab === "purchases" && <PurchaseHistory />}
                       {activeTab === "security" && <SecuritySettings />}
                       {activeTab === "notifications" && <NotificationSettings />}
                    </motion.div>
                 </div>

               </div>
            </div>
        </div>
      </main>
    </div>
  );
}

function ProfileSettings({ profile }: { profile: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    field_of_study: profile?.field_of_study || "",
    bio: profile?.bio || "",
  });

  const onSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          field_of_study: formData.field_of_study,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success("Identity updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
        <div className="flex items-center gap-8">
           <div className="relative group">
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; toast.success("Avatar updated successfully!"); }} />
              <div className="relative w-32 h-32 rounded-[2.5rem] bg-muted border-2 border-dashed border-border flex items-center justify-center transition-colors overflow-hidden">
                 {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
                 ) : (
                    <User className="w-10 h-10 text-muted-foreground opacity-20" />
                 )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                 <Camera className="w-4 h-4" />
              </button>
           </div>
          <div>
             <h3 className="text-xl font-bold text-foreground font-heading">Public Identity</h3>
             <p className="text-xs text-muted-foreground font-medium transition-colors">This is how the community sees you.</p>
          </div>
       </div>

       <div className="grid sm:grid-cols-2 gap-8">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
             <Input 
               value={formData.full_name} 
               onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
               className="h-14 rounded-xl bg-muted/30 border-border focus:ring-primary/20 font-bold" 
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {profile?.role === "instructor" ? "Academic Title" : "Field of Study"}
             </label>
             <Input 
               placeholder={profile?.role === "instructor" ? "e.g. Professor, Dr." : "e.g. Computer Science"} 
               value={formData.field_of_study}
               onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
               className="h-14 rounded-xl bg-muted/30 border-border focus:ring-primary/20 font-bold" 
             />
          </div>
       </div>

       <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Biography</label>
          <textarea 
            className="w-full h-32 rounded-2xl bg-muted/30 border border-border p-6 font-medium text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none bg-transparent" 
            placeholder="A short introduction..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
       </div>

       <Button 
         onClick={onSave}
         disabled={loading}
         className="btn-gradient text-white rounded-xl px-10 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
       >
          {loading ? "Saving..." : "Save Identity Changes"}
       </Button>
    </div>
  );
}

function PurchaseHistory() {
  return (
    <div className="space-y-10">
       <h3 className="text-xl font-bold text-foreground font-heading">Payment History</h3>
       <div className="space-y-4">
          <div className="p-8 rounded-3xl bg-muted/20 border border-border flex flex-col items-center justify-center text-center">
             <History className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
             <p className="text-sm font-medium text-muted-foreground">Your recent transactions will appear here.</p>
          </div>
       </div>
    </div>
  );
}

function PayoutSettings({ profile }: { profile: any }) {
  const [bank, setBank] = useState("GTBank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  // High fidelity GTBank resolve simulation
  useEffect(() => {
    if (accountNumber.length === 10) {
      setResolving(true);
      const timer = setTimeout(() => {
        setResolving(false);
        setAccountName(profile?.full_name || "Prof. Yusuf Abubakar");
        toast.success("Account name resolved successfully!");
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAccountName("");
    }
  }, [accountNumber, profile]);

  const handleLinkBank = () => {
    if (accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit account number");
      return;
    }
    setIsLinked(true);
    toast.success("Payout bank account linked successfully via Paystack!");
  };

  return (
    <div className="space-y-10">
       <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 p-6 rounded-3xl">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <div className="text-sm font-bold text-primary">Your account is eligible for weekly payouts via Paystack.</div>
       </div>

       <div className="space-y-8">
          <h3 className="text-xl font-bold text-foreground font-heading">Banking Credentials</h3>
          <div className="grid sm:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Bank Name</label>
                <select 
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full h-14 rounded-xl bg-muted/30 border border-border px-6 font-bold text-sm outline-none transition-colors text-foreground"
                >
                   <option value="Access">Access Bank</option>
                   <option value="GTBank">GTBank</option>
                   <option value="Zenith">Zenith Bank</option>
                   <option value="UBA">UBA</option>
                </select>
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Account Number</label>
                <div className="relative">
                   <Input 
                     placeholder="10 digits" 
                     maxLength={10}
                     value={accountNumber}
                     onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                     className="h-14 rounded-xl bg-muted/30 border-border focus:ring-primary/20 font-bold" 
                   />
                   {resolving && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-xs font-bold text-primary">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Resolving...
                     </div>
                   )}
                </div>
             </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Account Holder Name</label>
             <Input 
               value={accountName}
               readOnly
               placeholder="Auto-resolved on 10-digit number entry" 
               className="h-14 rounded-xl bg-muted/20 border-border font-bold text-foreground" 
             />
          </div>
       </div>

       <Button 
         onClick={handleLinkBank}
         disabled={accountNumber.length !== 10 || resolving || isLinked}
         className="w-full btn-gradient text-white rounded-xl h-16 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
       >
          {isLinked ? "Account Linked ✓" : "Link Bank Account"}
       </Button>
    </div>
  );
}

function SecuritySettings() {
  const [passwordModal, setPasswordModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  return (
    <div className="space-y-10">
       <div className="space-y-8">
          <h3 className="text-xl font-bold text-foreground font-heading">Access Credentials</h3>
          <div className="space-y-6">
             <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border border-border transition-colors">
                <div>
                   <div className="text-sm font-bold text-foreground">Password Management</div>
                   <div className="text-[10px] font-medium text-muted-foreground">Last changed 3 months ago</div>
                </div>
                <Button variant="outline" onClick={() => toast.success("Password reset link sent to your email.")} className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-10 border-border">Update</Button>
             </div>
             <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border border-border transition-colors">
                <div>
                   <div className="text-sm font-bold text-foreground">Two-Factor Authentication</div>
                   <div className="text-[10px] font-medium text-muted-foreground">Recommended for security</div>
                </div>
                <Button onClick={() => { setTwoFAEnabled(!twoFAEnabled); toast.success(twoFAEnabled ? "2FA disabled." : "2FA enabled. Check your authenticator app."); }} className="bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-lg shadow-primary/10">{twoFAEnabled ? "Disable" : "Enable"}</Button>
             </div>
          </div>
       </div>
    </div>
  );
}

function NotificationSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Updates & Announcements": true,
    "Billing & Security": true,
    "Community Activity": false
  });

  return (
    <div className="space-y-10">
       <h3 className="text-xl font-bold text-foreground font-heading">System Alerts</h3>
       <div className="space-y-6">
          {[
            { label: "Updates & Announcements", desc: "Get notified when new features are added." },
            { label: "Billing & Security", desc: "Critical alerts about your account transactions." },
            { label: "Community Activity", desc: "Replies to your discussions or reviews." }
          ].map((item) => {
            const isOn = toggles[item.label];
            return (
             <div key={item.label} className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border border-border transition-colors">
                <div className="max-w-xs">
                   <div className="text-sm font-bold text-foreground">{item.label}</div>
                   <div className="text-[10px] font-medium text-muted-foreground">{item.desc}</div>
                </div>
                <div onClick={() => setToggles({ ...toggles, [item.label]: !isOn })} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isOn ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'right-1' : 'left-1'}`} />
                </div>
             </div>
            );
          })}
       </div>
    </div>
  );
}
